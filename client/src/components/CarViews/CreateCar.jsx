import { useNavigate } from "react-router-dom";
import { useCreateCar } from "../../api/car.js";

export default function CreateCar() {
    const navigate = useNavigate()

    const { createCar } = useCreateCar();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        const result = await createCar(data);

        navigate(`/cars/${result.id}`);
    }
    return (
        <>
        
        </>
    )
}