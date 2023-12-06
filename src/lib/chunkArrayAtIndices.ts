export function chunkArrayAtIndices<T>(arr: T[], indices: number[]): T[][] {
    if (!Array.isArray(arr) || !Array.isArray(indices)) {
        throw new Error('Both arguments must be arrays.');
    }

    // Sort indices in ascending order to ensure correct chunks
    indices.sort((a, b) => a - b);

    // Initialize the result array
    const result: T[][] = [];

    // Iterate through the indices to chunk the array
    let startIndex = 0;
    for (const index of indices) {
        // Check if the index is within the array bounds
        if (index >= 0 && index < arr.length) {
            // Push the chunk from the current start index to the specified index
            result.push(arr.slice(startIndex, index));

            // Update the start index for the next chunk
            startIndex = index;
        }
    }

    // Push the remaining elements as the last chunk
    result.push(arr.slice(startIndex));

    return result;
}

