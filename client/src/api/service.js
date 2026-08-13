import request from '../utils/request.js';
import { useState, useEffect } from 'react';


const baseUrl = 'http://localhost:3000/api';

export const createService = async (carId, serviceData) => {
    try {
        return await request.post(`${baseUrl}/services/${carId}`, serviceData)
    }catch (err) {
        alert("Create service failed: " + (err.message || err.error));
    }
}

export const useServicesByCar = (carId) => {
    const [services, setServices] = useState([])
    useEffect(() => {
        if (!carId) return;

        request.get(`${baseUrl}/services/${carId}`)
            .then(setServices)
            .catch(err => {
                alert("Fetch services failed: " + (err.message || err.error));
            });
    }, [carId]);

    return services;
}

export const deleteService = async (id) => {
    try {
        return await request.delete(`${baseUrl}/services/${id}`);
    }
    catch (error){
        alert("Delete service failed: " + (error.message || error.error));
    }
}

export const editService = async (id, serviceData) => {
    try {
        return await request.put(`${baseUrl}/services/${id}`, serviceData)
    }catch (error){
        alert("Edit service failed: " + (error.message || error.error));
    }
}   
