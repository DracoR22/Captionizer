'use client'

import { useState } from 'react'
import UploadIcon from './icons/upload'
import axios from "axios"
import { useRouter } from 'next/navigation'

const UploadButton = () => {

    const [isUploading, setIsUploading] = useState<boolean>(false)
    const router = useRouter()

   const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
       e.preventDefault()

       const files = e.target.files

       if (files && files.length > 0) {
              const file = files[0]
              setIsUploading(true)
             
              const response = await axios.postForm('/api/upload', { file })
              setIsUploading(false)

              const newName = response.data.newName
              router.push(`/${newName}`)
       }
   }

  return (
   <>
      {isUploading && (
        <div className='bg-black/80 text-white fixed inset-0 flex items-center'>
            <div className='w-full text-center'>
              <h2 className='text-4xl mb-4'>Uploading...</h2>
              <h3 className='text-xl'>Please wait</h3>
            </div>
        </div>
      )}
      <label className="bg-indigo-500 text-white py-2 px-4 rounded-md inline-flex gap-2 cursor-pointer">
        <UploadIcon/>
         Choose file
        <input onChange={upload} type="file" className="hidden" accept='.mp4'/>
      </label>
   </>
  )
}

export default UploadButton