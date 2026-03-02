#!/usr/bin/env bash

# Read JSON input from stdin
input=$(cat)

# Extract fields using jq
current_dir=$(echo "$input" | jq -r '.workspace.current_dir // empty')
model_display=$(echo "$input" | jq -r '.model.display_name // empty')
output_style=$(echo "$input" | jq -r '.output_style.name // empty')
used_percentage=$(echo "$input" | jq -r '.context_window.used_percentage // empty')
remaining_percentage=$(echo "$input" | jq -r '.context_window.remaining_percentage // empty')
total_input=$(echo "$input" | jq -r '.context_window.total_input_tokens // empty')
total_output=$(echo "$input" | jq -r '.context_window.total_output_tokens // empty')
context_size=$(echo "$input" | jq -r '.context_window.context_window_size // empty')
session_name=$(echo "$input" | jq -r '.session_name // empty')
agent_name=$(echo "$input" | jq -r '.agent.name // empty')

# Get current time
current_time=$(date "+%H:%M")

# Get git branch if in a git repo
git_branch=""
if [ -n "$current_dir" ] && [ -d "$current_dir/.git" ] || git -C "$current_dir" rev-parse --git-dir > /dev/null 2>&1; then
    git_branch=$(git -C "$current_dir" rev-parse --abbrev-ref HEAD 2>/dev/null)
fi

# Shorten path - show last 2-3 directories
short_dir=""
if [ -n "$current_dir" ]; then
    # Convert Windows path if needed
    if [[ "$current_dir" == *:\\* ]]; then
        short_dir=$(basename "$current_dir")
    else
        short_dir=$(basename "$current_dir")
    fi
fi

# Build status line components
components=()

# Directory
if [ -n "$short_dir" ]; then
    components+=("$short_dir")
fi

# Git branch
if [ -n "$git_branch" ]; then
    components+=("[$git_branch]")
fi

# Agent name (if active)
if [ -n "$agent_name" ]; then
    components+=("agent:$agent_name")
fi

# Model name
if [ -n "$model_display" ]; then
    components+=("$model_display")
fi

# Session name (if set)
if [ -n "$session_name" ]; then
    components+=("($session_name)")
fi

# Output style
if [ -n "$output_style" ] && [ "$output_style" != "default" ]; then
    components+=("style:$output_style")
fi

# Context usage
if [ -n "$used_percentage" ] && [ "$used_percentage" != "null" ]; then
    components+=("ctx:${used_percentage}%")
fi

# Time
components+=("$current_time")

# Join components with separator
IFS=" | "
status_line="${components[*]}"
unset IFS

# Output the status line
echo "$status_line"
