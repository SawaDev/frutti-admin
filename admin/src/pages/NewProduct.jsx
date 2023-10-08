import React, { useState } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'

import Navbar from '../components/Navbar'
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { userRequest } from '../utils/requestMethods';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NewProduct = () => {
  const [file, setFile] = useState("");
  const [info, setInfo] = useState({})

  const navigate = useNavigate()

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: (product) => {
      return userRequest.post("/products", product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["products"])
    },
    onError: (error) => {
      alert(error?.response?.data.message)
    }
  })

  const handleClick = async (e) => {
    e.preventDefault();

    const data = new FormData()
    data.append("file", file)
    data.append("upload_preset", "upload");

    try {
      const uploadRes = await axios.post(
        "https://api.cloudinary.com/v1_1/sardor-s-company/image/upload",
        data
      );

      const { url } = uploadRes.data;

      const newProduct = {
        ...info,
        img: url,
      };

      createPostMutation.mutate(newProduct);
      navigate("/products");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <Navbar />
      <div className='m-4 p-5 shadow-lg rounded-xl mb-10'>
        <h1 className='text-xl font-semibold'>Yangi mahsulot kiritish</h1>
      </div>
      <div className='flex flex-col gap-5 sm:flex-row justify-between shadow-xl m-4 py-4 rounded-xl'>
        <div className='flex items-center justify-center w-full basis-2/5'>
          <img
            className='w-[150px] rounded-full object-cover'
            src={
              file
                ? URL.createObjectURL(file)
                : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
            }
            alt=""
          />
        </div>
        <div className='basis-3/5'>
          <div className='flex justify-around items-center'>
            <div className='flex flex-col w-2/5'>
              <label className='text-lg font-medium'>Name</label>
              <input onChange={handleChange} id="name" className='border-b-4 p-2 border-gray-300 rounded-md text-lg mt-1 outline-none' placeholder='Name' type="text" />
            </div>
            <div className='flex flex-col w-2/5'>
              <label className='text-lg font-medium'>Description</label>
              <input onChange={handleChange} id="description" className='border-b-4 p-2 border-gray-300 rounded-md text-lg mt-1 outline-none' placeholder='Description' type="text" />
            </div>
          </div>
          <div className='flex justify-around mt-5'>
            <div className="flex flex-col w-2/5">
              <label className='text-lg font-medium'>Soni</label>
              <input onChange={handleChange} id="soni" className='border-b-4 p-2 border-gray-300 rounded-md text-lg mt-1 outline-none' placeholder='Soni' type="number" />
            </div>
            <div className="flex flex-col w-2/5">
              <label className='text-lg font-medium'>Price</label>
              <input onChange={handleChange} id="price" className='border-b-4 p-2 border-gray-300 rounded-md text-lg mt-1 outline-none' placeholder='Price' type="number" />
            </div>
          </div>
          <div className="flex justify-around mt-5">
            <div>
              <label className='text-lg font-medium' htmlFor="file">
                Image: <DriveFolderUploadOutlinedIcon className="icon" />
              </label>
              <input
                type="file"
                id="file"
                multiple
                onChange={(e) => setFile(e.target.files[0])}
                style={{ display: "none" }}
              />
            </div>
            <div className="flex flex-col w-2/5">
              <label className='text-lg font-medium'>Tan narxi</label>
              <input onChange={handleChange} id="tanNarxi" className='border-b-4 p-2 border-gray-300 rounded-md text-lg mt-1 outline-none' placeholder='Price' type="number" />
            </div>
          </div>
          <div className="flex justify-around mt-5">
            <div className='px-4 py-2 bg-purple-100 font-semibold text-purple-600 rounded-xl' onClick={handleClick}>
              <button>Qo'shish</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewProduct