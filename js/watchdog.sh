#!/bin/bash

while true; do
	pids=($(pgrep electron))
	if [ $? -eq 0 ]; then
		ps -o pid=,etimes= -p "${pids[@]}" | while read pid time; do
			if [ "$time" -gt 75 ]; then
				echo "Killing $pid"
				kill "$pid"
			fi
		done
	fi
	sleep 5
done
