import React, { useState } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'

import Navbar from '../components/Navbar'
import { userRequest } from '../utils/requestMethods';
import { useNavigate } from 'react-router-dom';

const NewExpense = () => {
  const [info, setInfo] = useState({})

  const navigate = useNavigate()

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: (expense) => {
      return userRequest.post("/expenses", expense);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["expenses"])
    },
    onError: (error) => {
      alert(error?.response?.data.message)
    }
  })

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      createPostMutation.mutate(info);
      navigate("/expenses");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <Navbar />
      <div className='m-4 p-5 shadow-lg rounded-xl mb-10'>
        <h1 className='text-xl font-semibold'>Yangi harajatni kiritish</h1>
      </div>
      <div className='flex justify-around items-center'>
        <div className='flex flex-col w-2/5'>
          <label className='text-lg font-medium'>Summa</label>
          <input onChange={handleChange} id="cost" className='border-b-4 p-2 border-gray-300 rounded-md text-lg mt-1 outline-none' placeholder='Summa' type="number" />
        </div>
        <div className='flex flex-col w-2/5'>
          <label className='text-lg font-medium'>Sabab</label>
          <input onChange={handleChange} id="description" className='border-b-4 p-2 border-gray-300 rounded-md text-lg mt-1 outline-none' placeholder='Sabab' type="text" />
        </div>
        <div className='px-4 py-2 bg-purple-100 font-semibold text-purple-600 rounded-xl' onClick={handleClick}>
          <button>Saqlash</button>
        </div>
      </div>
    </div>
  )
}

export default NewExpense