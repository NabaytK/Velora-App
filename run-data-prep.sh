#!/bin/bash
echo "Preparing test data..."
python create_test_data.py
echo "Merging data..."
python merge.py
echo "Data preparation complete"
