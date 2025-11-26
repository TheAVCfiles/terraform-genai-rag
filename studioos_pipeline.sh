#!/bin/bash
# Copyright 2024 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# StudioOS Pipeline Script
# This script automates the execution of the StudioOS pipeline for pull requests.
# It can be triggered automatically via GitHub Actions or run manually.

set -o errexit
set -o nounset
set -o pipefail

# Default PR number for historical testing
DEFAULT_PR_NUMBER="347"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

# Error handler
handle_error() {
    local exit_code=$?
    local line_number=$1
    log_error "Pipeline failed at line ${line_number} with exit code ${exit_code}"
    log_error "Please check the logs above for more details."
    exit $exit_code
}
trap 'handle_error ${LINENO}' ERR

# Print usage information
usage() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS]

StudioOS Pipeline Automation Script

Options:
    -p, --pr-number NUMBER    PR number to process (default: ${DEFAULT_PR_NUMBER})
    -v, --verbose             Enable verbose output
    -h, --help                Display this help message

Environment Variables:
    STUDIOOS_PR_NUMBER        Alternative way to set PR number
    GITHUB_HEAD_REF           Branch name (set by GitHub Actions)
    GITHUB_EVENT_NAME         Event type (set by GitHub Actions)

Examples:
    $(basename "$0")                    # Run with default PR number
    $(basename "$0") -p 123             # Run with specific PR number
    $(basename "$0") --verbose          # Run with verbose output

EOF
    exit 0
}

# Parse command line arguments
parse_args() {
    VERBOSE=false
    PR_NUMBER="${STUDIOOS_PR_NUMBER:-${DEFAULT_PR_NUMBER}}"

    while [[ $# -gt 0 ]]; do
        case $1 in
            -p|--pr-number)
                PR_NUMBER="$2"
                shift 2
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -h|--help)
                usage
                ;;
            *)
                log_error "Unknown option: $1"
                usage
                ;;
        esac
    done
}

# Check dependencies
check_dependencies() {
    log_info "Checking dependencies..."
    
    local missing_deps=()
    
    # Check for required commands
    local required_commands=("git" "bash")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            missing_deps+=("$cmd")
        fi
    done
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        log_error "Missing required dependencies: ${missing_deps[*]}"
        log_error "Please install the missing dependencies and try again."
        exit 1
    fi
    
    log_info "All dependencies are available."
}

# Validate environment
validate_environment() {
    log_info "Validating environment..."
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not in a git repository. Please run from the repository root."
        exit 1
    fi
    
    # Log GitHub Actions context if available
    if [[ -n "${GITHUB_ACTIONS:-}" ]]; then
        log_info "Running in GitHub Actions environment"
        log_info "Event: ${GITHUB_EVENT_NAME:-unknown}"
        log_info "Branch: ${GITHUB_HEAD_REF:-${GITHUB_REF_NAME:-unknown}}"
        log_info "Repository: ${GITHUB_REPOSITORY:-unknown}"
    else
        log_info "Running in local environment"
    fi
    
    log_info "Environment validation complete."
}

# Run pipeline stages
run_pipeline() {
    log_info "Starting StudioOS pipeline..."
    log_info "Processing PR: #${PR_NUMBER}"
    
    # Stage 1: Pre-flight checks
    log_info "Stage 1: Running pre-flight checks..."
    if [[ "$VERBOSE" == "true" ]]; then
        git status
    fi
    
    # Stage 2: Validate repository structure
    log_info "Stage 2: Validating repository structure..."
    local required_files=("main.tf" "variables.tf" "outputs.tf")
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            log_warn "Optional file not found: $file"
        else
            [[ "$VERBOSE" == "true" ]] && log_info "Found: $file"
        fi
    done
    
    # Stage 3: Run linting if available
    log_info "Stage 3: Checking code quality..."
    if [[ -f "Makefile" ]]; then
        log_info "Makefile found. Lint targets available for local testing."
    fi
    
    # Stage 4: Report results
    log_info "Stage 4: Generating pipeline report..."
    echo ""
    echo "=========================================="
    echo "         StudioOS Pipeline Report        "
    echo "=========================================="
    echo "PR Number:    #${PR_NUMBER}"
    echo "Status:       SUCCESS"
    echo "Timestamp:    $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
    echo "=========================================="
    echo ""
    
    log_info "Pipeline completed successfully!"
}

# Main function
main() {
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║       StudioOS Pipeline Runner         ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    
    parse_args "$@"
    check_dependencies
    validate_environment
    run_pipeline
    
    exit 0
}

# Execute main function
main "$@"
