import { Box, Button, Text } from '@mantine/core'
import React from 'react'
import { apiRequest } from './utils/api'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {

  const navigation = useNavigate()

  const logout = async ()=>{
    try{
      const res = await apiRequest('POST' , '/api/adminauth/logout')
      navigation('/auth/login')
      console.log(res)
    }catch(err){
      console.log(err)
    }
  }

  return (
    <Box>
      <Button onClick={logout} >Logout</Button>
    </Box>
  )
}

export default Dashboard