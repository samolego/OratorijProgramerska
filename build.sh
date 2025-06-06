#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IGRE_DIR="$SCRIPT_DIR/igre"
INDEX_TEMPLATE="$SCRIPT_DIR/main.js"
OUTPUT_DIR="$SCRIPT_DIR/dist"
OUTPUT_FILE="$OUTPUT_DIR/main.js"
HTML_FILE="$OUTPUT_DIR/index.html"
CSS_FILE="$OUTPUT_DIR/styles.css"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

usage() {
    echo "Usage: $0 [generate|run] [port]"
    echo ""
    echo "Modes:"
    echo "  generate  - Generate hydrated index.html in dist/ directory"
    echo "  run       - Start local development server with hydrated content"
    echo ""
    echo "Examples:"
    echo "  $0 generate        # Build static site"
    echo "  $0 run             # Start dev server on http://localhost:8080"
    echo "  $0 run 3000        # Start dev server on http://localhost:3000"
}

scan_games() {
    local games_json="{"
    local first_year=true
    local total_games=0

    if [ ! -d "$IGRE_DIR" ]; then
        echo "{}" >&1
        log_warn "Games directory '$IGRE_DIR' not found" >&2
        return
    fi

    for year_dir in "$IGRE_DIR"/*; do
        if [ -d "$year_dir" ]; then
            local year=$(basename "$year_dir")

            # Validate year is numeric
            if ! [[ "$year" =~ ^[0-9]+$ ]]; then
                log_warn "Skipping non-numeric directory: $year" >&2
                continue
            fi

            if [ "$first_year" = false ]; then
                games_json="$games_json,"
            fi
            first_year=false

            games_json="$games_json\"$year\":["

            local first_game=true
            local game_count=0

            for game_file in "$year_dir"/*.html; do
                if [ -f "$game_file" ]; then
                    local game_name=$(basename "$game_file" .html)
                    local game_path="igre/$year/$(basename "$game_file")"

                    if [ "$first_game" = false ]; then
                        games_json="$games_json,"
                    fi
                    first_game=false

                    # Escape quotes in game name for JSON
                    local escaped_name=$(echo "$game_name" | sed 's/"/\\"/g')

                    games_json="$games_json{\"name\":\"$escaped_name\",\"path\":\"$game_path\"}"
                    ((game_count++))
                fi
            done

            games_json="$games_json]"

            if [ $game_count -eq 0 ]; then
                log_warn "No HTML files found in $year_dir" >&2
            else
                log_info "Found $game_count games for year $year" >&2
            fi

            total_games=$((total_games + game_count))
        fi
    done

    games_json="$games_json}"
    echo "$games_json" >&1

    if [ $total_games -eq 0 ]; then
        log_warn "No games found in any year directory" >&2
    fi
}

generate_site() {
    log_info "Generating static site..."

    if [ ! -f "$INDEX_TEMPLATE" ]; then
        log_error "Template file not found: $INDEX_TEMPLATE"
        exit 1
    fi

    # Create output directory
    mkdir -p "$OUTPUT_DIR"

    # Scan for games
    log_info "Scanning for games in $IGRE_DIR..."
    local games_data=$(scan_games)

    # Read template and replace placeholder using a temporary file approach
    local temp_file=$(mktemp)
    cat "$INDEX_TEMPLATE" > "$temp_file"

    # Use awk to replace the placeholder line
    awk -v games_data="$games_data" '
        /const GAMES_DATA = \{\};/ {
            print "        const GAMES_DATA = " games_data ";"
            next
        }
        { print }
    ' "$temp_file" > "$OUTPUT_FILE"

    # Clean up temporary file
    rm "$temp_file"

    # Copy games directory to output
    if [ -d "$IGRE_DIR" ]; then
        log_info "Copying games to output directory..."
        cp -r "$IGRE_DIR" "$OUTPUT_DIR/"
    fi

    # Copy CSS and HTML files
    if [ -f "$SCRIPT_DIR/styles.css" ]; then
        cp "$SCRIPT_DIR/styles.css" "$CSS_FILE"
    fi
    if [ -f "$SCRIPT_DIR/index.html" ]; then
        cp "$SCRIPT_DIR/index.html" "$HTML_FILE"
    fi

    # Create timestamp file for hot reload
    echo "$(date +%s)" > "$OUTPUT_DIR/build-timestamp.txt"

    log_success "Site generated successfully!"
    log_info "Output directory: $OUTPUT_DIR"
    log_info "Main file: $OUTPUT_FILE"
}

watch_files() {
    log_info "Starting file watcher for hot reload..."

    while true; do
        # Počakaj 2 sekundi
        sleep 2

        # Preveri spremembe v source datotekah
        local needs_rebuild=false

        for file in "$SCRIPT_DIR/index.html" "$SCRIPT_DIR/main.js" "$SCRIPT_DIR/styles.css"; do
            if [ -f "$file" ]; then
                # Pridobi čas spremembe datoteke
                local file_time=$(stat -c %Y "$file" 2>/dev/null || stat -f %m "$file" 2>/dev/null)
                local cache_file="$OUTPUT_DIR/.cache_$(basename "$file")"

                if [ -f "$cache_file" ]; then
                    local cached_time=$(cat "$cache_file")
                    if [ "$file_time" != "$cached_time" ]; then
                        needs_rebuild=true
                        echo "$file_time" > "$cache_file"
                        log_info "Sprememba zaznana v: $(basename "$file")"
                    fi
                else
                    echo "$file_time" > "$cache_file"
                fi
            fi
        done

        # Preveri tudi igre v igre/ direktoriju
        if [ -d "$IGRE_DIR" ]; then
            for game_file in "$IGRE_DIR"/*/*.html; do
                if [ -f "$game_file" ]; then
                    local file_time=$(stat -c %Y "$game_file" 2>/dev/null || stat -f %m "$game_file" 2>/dev/null)
                    local cache_file="$OUTPUT_DIR/.cache_$(basename "$game_file")"

                    if [ -f "$cache_file" ]; then
                        local cached_time=$(cat "$cache_file")
                        if [ "$file_time" != "$cached_time" ]; then
                            needs_rebuild=true
                            echo "$file_time" > "$cache_file"
                            log_info "Sprememba zaznana v igri: $(basename "$game_file")"
                        fi
                    else
                        echo "$file_time" > "$cache_file"
                    fi
                fi
            done
        fi

        if [ "$needs_rebuild" = true ]; then
            log_info "Rebuilding zaradi sprememb..."
            generate_site
        fi
    done
}

run_dev_server() {
    log_info "Starting development server with hot reload..."

    # Generate site first
    generate_site

    # Start file watcher in background
    watch_files &
    local watcher_pid=$!

    # Cleanup function
    cleanup() {
        log_info "Stopping development server..."
        kill $watcher_pid 2>/dev/null
        exit 0
    }

    # Trap cleanup on script exit
    trap cleanup SIGINT SIGTERM

    # Check for available HTTP server
    local server_cmd=""
    local port=${1:-8080}


    if command -v python3 &> /dev/null; then
        server_cmd="python3 -m http.server $port"
        log_info "Using Python 3 http.server"
    elif command -v npx &> /dev/null && npx http-server --help &> /dev/null; then
        server_cmd="npx http-server -p $port -c-1 --cors --silent"
        log_success "Using npm http-server (best for development - no caching, CORS enabled)"
    elif command -v php &> /dev/null; then
        server_cmd="php -S localhost:$port"
        log_info "Using PHP built-in server"
    elif command -v ruby &> /dev/null; then
        server_cmd="ruby -run -e httpd . -p $port"
        log_info "Using Ruby built-in server"
    else
        log_error "No suitable HTTP server found."
        log_info "Install options:"
        log_info "  • npm install -g http-server (recommended)"
        log_info "  • Python 3: sudo apt install python3"
        log_info "  • PHP: sudo apt install php"
        log_info "  • Ruby: sudo apt install ruby"
        log_info "Alternatively, serve the files from: $OUTPUT_DIR"
        exit 1
    fi
    log_success "Server starting at http://localhost:$port"
    log_info "Hot reload enabled - watching for file changes..."
    log_info "Press Ctrl+C to stop the server"

    cd "$OUTPUT_DIR"
    # Preusmeri output v /dev/null za čisti izpis (razen za npm http-server ki ima --silent)
    if [[ "$server_cmd" == *"npx http-server"* ]]; then
        $server_cmd
    else
        $server_cmd > /dev/null 2>&1
    fi
}

# Main script logic
if [ $# -eq 0 ]; then
    usage
    exit 1
fi

case "$1" in
    generate)
        generate_site
        ;;
    run)
        run_dev_server "$2"
        ;;
    -h|--help)
        usage
        ;;
    *)
        log_error "Unknown command: $1"
        usage
        exit 1
        ;;
esac
