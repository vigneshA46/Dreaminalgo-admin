import { Box, ScrollArea, Table, Text } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks';
import React, { useEffect, useState } from 'react'
import { apiRequest } from './utils/api';
import { Modal, Button, TextInput, Switch, NumberInput, Group } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import DeploymentsDashboard from './DeploymentsDashboard';

const Users = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [users , setusers] = useState([])
  const [activeTab, setActiveTab] = useState('users');
  //marketplace == users , my strategies== deployments

  const [opened, setOpened] = useState(false);
const [selectedUser, setSelectedUser] = useState(null);

const [form, setForm] = useState({
  fullname: "",
  isactive: false,
  mobile_number: "",
  tokens: 0
});

const handleEditClick = (user) => {
  setSelectedUser(user);
  setForm({
    fullname: user.fullname || "",
    isactive: user.isactive || false,
    mobile_number: user.mobile_number || "",
    tokens: user.tokens || 0
  });
  setOpened(true);
};




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

  const updateuser = async () => {
  try {
    const payload = {
      ...form,
      tokens: String(form.tokens), // ✅ convert to text
    };

    const res = await apiRequest(
      'PUT',
      `/api/users/${selectedUser.id}`,
      payload
    );

    console.log(res);

    // update UI
    setusers((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id ? { ...u, ...payload } : u
      )
    );

    setOpened(false);
  } catch (err) {
    console.log(err);
  }
};

  return (
    <>
  

              <Group gap="md" mb="xl">
                <Button
                  size="md"
                  radius="xl"
                  style={{
                    backgroundColor: activeTab === 'users' ? '#000000ff' : 'transparent',
                    color: activeTab === 'users' ? 'white' : '#495057',
                    border: 'none',
                    fontWeight: 500,
                    paddingLeft: '28px',
                    paddingRight: '28px',
                  }}
                  onClick={() => setActiveTab('users')}
                >
                  Users
                </Button>
                <Button
                  size="md"
                  radius="xl"
                  variant="subtle"
                  style={{
                    backgroundColor: activeTab === 'deployments' ? '#000000ff' : 'transparent',
                    color: activeTab === 'deployments' ? 'white' : '#495057',
                    border: 'none',
                    fontWeight: 500,
                    paddingLeft: '28px',
                    paddingRight: '28px',
                  }}
                  onClick={() => setActiveTab('deployments')}
                >
                  Deployments
                </Button>
              </Group>
     <Box
              w={isMobile? '100vw':'100%'}
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  
                }}
              >

                {
                  activeTab == 'users'?  <ScrollArea  w={isMobile? '100vw':'100%'}
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
                       Mobile Number
                     </Table.Th>
                     <Table.Th style={{ color: '#868e96', fontWeight: 600, fontSize: '14px', padding: '16px',whiteSpace: "nowrap" }}>
                       Created at
                     </Table.Th>
                     <Table.Th style={{ color: '#868e96', fontWeight: 600, fontSize: '14px', padding: '16px',whiteSpace: "nowrap" }}>
                       Token
                     </Table.Th>
                     <Table.Th>Action</Table.Th>
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
          {user?.mobile_number}
        </Table.Td>
        <Table.Td>
          {new Date(user.createdat).toLocaleString()}
        </Table.Td>
        <Table.Td>{user.tokens}</Table.Td>
        <Table.Td>
  <Button
    variant="subtle"
    onClick={() => handleEditClick(user)}
  >
    <IconEdit size={18} />
  </Button>
</Table.Td>
      </Table.Tr>
    ))
  )}
</Table.Tbody>
               </Table>
               </ScrollArea> 
               :

               <><DeploymentsDashboard/></>
                }
                 
               </Box>


               <Modal
  opened={opened}
  onClose={() => setOpened(false)}
  title="Edit User"
  centered
>
  <TextInput
    label="Full Name"
    value={form.fullname}
    onChange={(e) =>
      setForm({ ...form, fullname: e.target.value })
    }
    mb="sm"
  />

  <TextInput
    label="Mobile Number"
    value={form.mobile_number}
    onChange={(e) =>
      setForm({ ...form, mobile_number: e.target.value })
    }
    mb="sm"
  />

  <NumberInput
    label="Tokens"
    value={form.tokens}
    onChange={(value) =>
      setForm({ ...form, tokens: value })
    }
    mb="sm"
  />

  <Switch
    label="Active Status"
    checked={form.isactive}
    onChange={(e) =>
      setForm({ ...form, isactive: e.currentTarget.checked })
    }
    mb="md"
  />

  <Group justify="flex-end">
    <Button
      onClick={updateuser}
      style={{ backgroundColor: "black" }}
    >
      Update User
    </Button>
  </Group>
</Modal>
    </>
  )
}

export default Users