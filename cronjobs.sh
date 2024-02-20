#!/bin/bash

# Define an array of cron jobs with versioning
CRON_JOBS=(
    "# v1 - Cleanup audio and video files in /tmp older than 1 hour"
    "0 0 * * * find /tmp -maxdepth 1 \( -name 'audio_*' -o -name 'video_*' \) -type f -mmin +60 -delete"
    "# Add more cron jobs here if needed"
)

# Check and add each cron job
for ((i = 0; i < ${#CRON_JOBS[@]}; i++)); do
    # Check if the line is a comment
    if [[ ${CRON_JOBS[i]} =~ ^# ]]; then
        COMMENT=${CRON_JOBS[i]}
        
        # Check if a valid command follows the comment
        if ((i + 1 < ${#CRON_JOBS[@]})) && ! [[ ${CRON_JOBS[i + 1]} =~ ^# ]]; then
            COMMAND=${CRON_JOBS[i + 1]}
            
            # Check if the cron job with the same comment already exists
            if ! crontab -l | grep -q "^$COMMENT"; then
                # If not, add the cron job
                (crontab -l ; echo "$COMMENT"; echo "$COMMAND") | crontab -
                echo "Cron job added successfully: $COMMENT"
            else
                echo "Cron job with comment $COMMENT already exists: $COMMAND"
            fi
        fi
    fi
done