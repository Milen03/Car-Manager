import { useState, useEffect } from 'react';
import request from '../utils/request.js';


const baseUrl = 'http://localhost:3000/api';

export const useCreateCar = () => {
   
    const createCar = async (carData) => {
        try {
            return await request.post(`${baseUrl}/cars`, carData)
        }catch (err) {
            alert("Create car failed: " + err.message);
        }
    }

    return {
        createCar
    }
}

export const useCars = () => {
    const [cars, setCars] = useState([])

    useEffect(() => {
        request.get(`${baseUrl}/cars`)
        .then(setCars)
        .catch(err => {
            alert("Fetch cars failed: " + err.message);
        });
    }, []);

    return {
        cars
    }
}

export const useCar = (id) => {
    const [car, setCar] = useState(null);

    useEffect(() => {
        request.get(`${baseUrl}/cars/${id}`)
        .then(setCar)
        .catch(err => {
            alert("Fetch car failed: " + err.message);
        });
    }, [id]);

    return {
        car
    }
}

export const useDelete = () =>{

    const deleteCar = async (id) => {
        try {
            return await request.delete(`${baseUrl}/cars/${id}`)
        }catch (error){
            alert("Delete car failed: " + error.message);
        }
    }
    return {
        deleteCar
    }
}

export const useEdit = () =>{

    const editCar = async (id, carData) => {
        try{
            return await request.put(`${baseUrl}/cars/${id}`, carData)
        }catch (error){
            alert("Edit car failed: " + error.message);
        }
    }
    return {
        editCar
    }
}