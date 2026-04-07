import { Box, ScrollArea, Table, Text } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks';
import React, { useEffect, useState } from 'react'
import { apiRequest } from './utils/api';

const Users = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [users , setusers] = useState([])

  useEffect(()=>{
    const fetchusers = async ()=>{
      try{
        const res = await apiRequest('POST','/api/users')
        console.log(res)
        setusers(res)
      }catch(err){
        console.log(err)
      }
    }
    fetchusers()
  }, [])
  return (
    <>
    <Text p={"1rem"} size='1.5rem' fw={"500"} >Users</Text>
     <Box
              w={isMobile? '100vw':'100%'}
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  
                }}
              >
                  <ScrollArea  w={isMobile? '100vw':'100%'}
                    type="auto"
                    scrollbarSize={6}
                    offsetScrollbars>
               <Table     
                 w={isMobile? '100vw': '100%'}
              horizontalSpacing="md"
              verticalSpacing="md"
               >
                 <Table.Thead>
                   <Table.Tr style={{ backgroundColor: '#ffffffff' }}>
                     <Table.Th style={{ color: '#868e96', fontWeight: 600, fontSize: '14px', padding: '16px',whiteSpace: "nowrap" }}>
                       S.No
                     </Table.Th>
                     <Table.Th style={{ color: '#868e96', fontWeight: 600, fontSize: '14px', padding: '16px' ,whiteSpace: "nowrap"}}>
                       User Name
                     </Table.Th>
                     <Table.Th style={{ color: '#868e96', fontWeight: 600, fontSize: '14px', padding: '16px',whiteSpace: "nowrap" }}>
                       Email
                     </Table.Th>
                     <Table.Th style={{ color: '#868e96', fontWeight: 600, fontSize: '14px', padding: '16px',whiteSpace: "nowrap" }}>
                       is active
                     </Table.Th>
                     <Table.Th style={{ color: '#868e96', fontWeight: 600, fontSize: '14px', padding: '16px',whiteSpace: "nowrap" }}>
                       Created at
                     </Table.Th>
                     <Table.Th style={{ color: '#868e96', fontWeight: 600, fontSize: '14px', padding: '16px',whiteSpace: "nowrap" }}>
                       Token
                     </Table.Th>
                   </Table.Tr>
                 </Table.Thead>
                 <Table.Tbody>
  {users.length === 0 ? (
    <Table.Tr>
      <Table.Td
        colSpan={6}
        style={{
          textAlign: 'center',
          padding: '60px',
          color: '#adb5bd',
          whiteSpace: "nowrap"
        }}
      >
        <Text size="sm">No users available</Text>
      </Table.Td>
    </Table.Tr>
  ) : (
    users.map((user, index) => (
      <Table.Tr key={user.id}>
        <Table.Td>{index + 1}</Table.Td>
        <Table.Td>{user.fullname}</Table.Td>
        <Table.Td>{user.email}</Table.Td>
        <Table.Td>
          {user.isactive ? "Active" : "Inactive"}
        </Table.Td>
        <Table.Td>
          {new Date(user.createdat).toLocaleString()}
        </Table.Td>
        <Table.Td>{user.tokens}</Table.Td>
      </Table.Tr>
    ))
  )}
</Table.Tbody>
               </Table>
               </ScrollArea>
               </Box>
    </>
  )
}

export default Users