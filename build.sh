#!/bin/bash

if ! tsc; then
	exit $?
fi
echo "Finished typescript compilation... 😳"

if ! node minify.js; then
	exit $?
fi
echo "Finished minification... 😏"

read -rp "Done building... Press enter to continue! 🙉"
