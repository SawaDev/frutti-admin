import React, { useState } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'

import Navbar from '../components/Navbar'
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { userRequest } from '../utils/requestMethods';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NewClient = () => {
  const [info, setInfo] = useState({})

  const navigate = useNavigate()

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const queryClient = useQueryClient();
  const createPostMutation = useMutation({
    mutationFn: (data) => {
      return userRequest.post("/clients", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["clients"])
    },
    onError: (error) => {
      alert(error?.response?.data.message)
    }
  })

  const handleClick = async (e) => {
    e.preventDefault();

    try {
      createPostMutation.mutate(info);
      navigate("/clients");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <Navbar />
      <div className='m-4 p-5 shadow-lg rounded-xl mb-10'>
        <h1 className='text-xl font-semibold'>Yangi xaridor kiritish</h1>
      </div>
      <div className='flex flex-col gap-4 sm:flex-row justify-between items-center px-4 shadow-xl m-4 py-4 rounded-xl'>
        <div className='flex flex-col'>
          <label className='text-lg font-medium'>Ism</label>
          <input onChange={handleChange} id="name" className='border-b-4 p-2 border-gray-300 rounded-md text-lg mt-1 outline-none' placeholder='Ism' type="text" />
        </div>
        <div className="flex flex-col">
          <label className='text-lg font-medium'>Mablag'</label>
          <input onChange={handleChange} id="cash" className='border-b-4 p-2 border-gray-300 rounded-md text-lg mt-1 outline-none' placeholder="Mablag'" type="number" defaultValue={0} />
        </div>
        <div className="flex flex-col">
          <label className='text-lg font-medium'>Telegram Username</label>
          <input onChange={handleChange} id="tgUsername" className='border-b-4 p-2 border-gray-300 rounded-md text-lg mt-1 outline-none' placeholder="Username" type="text" />
        </div>
        <div>
          <div className='px-5 py-3 bg-purple-100 font-semibold text-purple-600 text-lg rounded-xl' onClick={handleClick}>
            <button>Qo'shish</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewClient