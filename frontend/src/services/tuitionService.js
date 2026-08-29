// src/services/tuitionService.js


const API_BASE_URL = 'http://localhost:5000/api';

export const fetchTuitionJobs = async (params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const url = `${API_BASE_URL}/tuitions${queryString ? `?${queryString}` : ''}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - Failed to fetch data`);
        }
        
        return await response.json();
    } catch (error) {
        console.error("Database connection error in tuitionService:", error);
        throw error; // Throw it so the Controller/View can handle the error state if needed
    }
};

export const createTuitionPost = async (postData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/tuitions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - Failed to create tuition post`);
        }

        return await response.json();
    } catch (error) {
        console.error("Database connection error in createTuitionPost:", error);
        throw error; 
    }
};