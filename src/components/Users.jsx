import { Avatar, Badge, Box, Card, ScrollArea, SimpleGrid, Stack, Table, Text } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks';
import React, { useEffect, useState , useMemo } from 'react'
import { apiRequest } from './utils/api';
import { Modal, Button, TextInput, Switch, NumberInput, Group, PasswordInput } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import DeploymentsDashboard from './DeploymentsDashboard';
import { notifications } from "@mantine/notifications";

const Users = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [users , setusers] = useState([])
  const [lowTokenUsers, setLowTokenUsers] = useState([])

  const [activeTab, setActiveTab] = useState('users');

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordUser, setPasswordUser] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [passwordForm, setPasswordForm] = useState({
   password: "",
    confirmPassword: ""
  });

  const fetchLowTokenUsers = async () => {
  try {
    const res = await apiRequest(
      "POST",
      "/api/users/low-tokens"
    );

    setLowTokenUsers(res);
  } catch (err) {
    console.log("Error fetching low token users:", err);
  }
};


const handlePasswordClick = (user) => {
  setPasswordUser(user);
  setPasswordForm({
    password: "",
    confirmPassword: ""
  });
  setPasswordModalOpen(true);
};


const changePassword = async () => {

  if (passwordLoading) return;

  try {

    if (!passwordForm.password || !passwordForm.confirmPassword) {

      notifications.show({
        title: "Missing Fields",
        message: "Please fill all fields",
        color: "red",
      });

      return;
    }

    if (passwordForm.password !== passwordForm.confirmPassword) {

      notifications.show({
        title: "Password Mismatch",
        message: "Passwords do not match",
        color: "red",
      });

      return;
    }

    setPasswordLoading(true);

    await apiRequest(
      "POST",
      "/api/auth/change-password-admin",
      {
        userId: passwordUser.id,
        password: passwordForm.password,
      }
    );

    notifications.show({
      title: "Password Updated",
      message: `Password updated for ${passwordUser.fullname}`,
      color: "green",
    });

    setPasswordModalOpen(false);

  } catch (err) {

    console.log(err);

    notifications.show({
      title: "Update Failed",
      message: err.message || "Failed to update password",
      color: "red",
    });

  } finally {
    setPasswordLoading(false);
  }
};

const [opened, setOpened] = useState(false);
const [selectedUser, setSelectedUser] = useState(null);

const [form, setForm] = useState({
  fullname: "",
  isactive: false,
  mobile_number: "",
  tokens: 0,
  status: "",
  remarks: "",
});

const handleEditClick = (user) => {
  setSelectedUser(user);

  setForm({
    fullname: user.fullname || "",
    isactive: user.isactive || false,
    mobile_number: user.mobile_number || "",
    tokens: user.tokens || 0,
    status: user.status || "",
    remarks: user.remarks || "",
  });

  setOpened(true);
};

  useEffect(()=>{
    const fetchusers = async ()=>{
      try{
        const res = await apiRequest('POST','/api/users')
        //console.log(res)
        setusers(res)
      }catch(err){
        console.log(err)
      }
    }
    fetchusers()
    fetchLowTokenUsers();

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

    //console.log(res);

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

const deleteUser = async (user) => {
  const confirmDelete = window.confirm(
    `Are you sure you want to delete ${user.fullname}?`
  );

  if (!confirmDelete) return;

  try {
    await apiRequest(
      "DELETE",
      `/api/users/${user.id}`
    );

    // Remove user from UI immediately
    setusers((prevUsers) =>
      prevUsers.filter((u) => u.id !== user.id)
    );

    notifications.show({
      title: "User Deleted",
      message: `${user.fullname} has been deleted successfully.`,
      color: "green",
    });

  } catch (err) {
    console.log(err);

    notifications.show({
      title: "Delete Failed",
      message: err.message || "Failed to delete user.",
      color: "red",
    });
  }
};

const filteredUsers = useMemo(() => {
  const query = search.trim().toLowerCase();

  if (!query) return users;

  return users.filter((user) => {
    return (
      user.fullname?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.mobile_number?.toLowerCase().includes(query)
    );
  });
}, [users, search]);


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

                {/* LOW TOKEN USERS */}

{activeTab === 'users' && (
  <Box mb="xl">

    <Group
      justify="space-between"
      align="flex-end"
      mb="md"
    >
      <Box>
        <Text
          size="xl"
          fw={700}
          c="#212529"
        >
          Low Token Users
        </Text>

        <Text
          size="sm"
          c="#868e96"
          mt={4}
        >
          Users with fewer than 5 tokens
        </Text>
      </Box>

      <Badge
        size="lg"
        variant="light"
        color="red"
        radius="xl"
      >
        {lowTokenUsers.length} Users
      </Badge>
    </Group>


    {lowTokenUsers.length === 0 ? (

      <Card
        radius="lg"
        withBorder
        p="xl"
        style={{
          borderColor: "#e9ecef",
          backgroundColor: "#fafafa",
        }}
      >
        <Stack
          align="center"
          gap="xs"
        >
          <Text
            size="sm"
            fw={600}
            c="#495057"
          >
            No low-token users
          </Text>

          <Text
            size="xs"
            c="#868e96"
          >
            All users currently have 5 or more tokens.
          </Text>
        </Stack>
      </Card>

    ) : (

      <SimpleGrid
        cols={{
          base: 1,
          sm: 2,
          md: 3,
          lg: 4
        }}
        spacing="md"
      >

        {lowTokenUsers.map((user) => {

          const initials = user.fullname
            ? user.fullname
                .split(" ")
                .map((name) => name[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            : "U";

          return (

            <Card
              key={user.id}
              radius="lg"
              padding="lg"
              withBorder
              style={{
                borderColor: "#e9ecef",
                backgroundColor: "white",
                transition: "all 0.2s ease",
                cursor: "pointer",
              }}
              onClick={() => handleEditClick(user)}
            >

              <Group
                justify="space-between"
                align="flex-start"
                mb="md"
              >

                <Avatar
                  size={48}
                  radius="xl"
                  color="dark"
                >
                  {initials}
                </Avatar>

                <Badge
                  color="red"
                  variant="light"
                  radius="xl"
                >
                  Low Tokens
                </Badge>

              </Group>


              <Box mb="md">

                <Text
                  fw={650}
                  size="md"
                  c="#212529"
                  lineClamp={1}
                >
                  {user.fullname || "Unknown User"}
                </Text>

                <Text
                  size="xs"
                  c="#868e96"
                  mt={4}
                  lineClamp={1}
                >
                  {user.email || "No email available"}
                </Text>

              </Box>


              <Box
                style={{
                  borderTop: "1px solid #f1f3f5",
                  paddingTop: "12px",
                }}
              >

                <Group
                  justify="space-between"
                  align="center"
                >

                  <Box>

                    <Text
                      size="xs"
                      c="#868e96"
                    >
                      Available Tokens
                    </Text>

                    <Text
                      size="xl"
                      fw={700}
                      c="#dc3545"
                    >
                      {user.tokens ?? 0}
                    </Text>

                  </Box>


                  <Box
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      backgroundColor: "#fff5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      size="sm"
                      fw={700}
                      c="#dc3545"
                    >
                      {user.tokens ?? 0}
                    </Text>
                  </Box>

                </Group>

              </Box>

            </Card>

          );

        })}

      </SimpleGrid>

    )}

  </Box>
)}

                <TextInput
  placeholder="Search by Name, Email or Mobile Number..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  mb="md"
/>

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
                     <Table.Th>Change Password</Table.Th>
                     <Table.Th>Status</Table.Th>
                      <Table.Th>Remarks</Table.Th>
                   </Table.Tr>
                 </Table.Thead>
                 <Table.Tbody>
  {filteredUsers.length === 0 ? (
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
    filteredUsers.map((user, index) => (
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
  <Group gap="xs">

    {/* Edit */}
    <Button
      variant="subtle"
      onClick={() => handleEditClick(user)}
    >
      <IconEdit size={18} />
    </Button>

    {/* Delete */}
    <Button
      variant="subtle"
      color="red"
      onClick={() => deleteUser(user)}
    >
      Delete
    </Button>

  </Group>
</Table.Td>
<Table.Td>
  <Button
    variant="subtle"
    onClick={() => handlePasswordClick(user)}
  >
    Change
  </Button>
</Table.Td>
  <Table.Td>{user.status || "-"}</Table.Td>
  <Table.Td>{user.remarks || "-"}</Table.Td>
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
  opened={passwordModalOpen}
  onClose={() => {
    if (!passwordLoading) {
      setPasswordModalOpen(false);
    }}}
  title="Change Password"
  centered
>
  <PasswordInput
  label="New Password"
  value={passwordForm.password}
  onChange={(e) =>
    setPasswordForm({
      ...passwordForm,
      password: e.target.value
    })
  }
  mb="sm"
/>

 <PasswordInput
  label="Confirm Password"
  value={passwordForm.confirmPassword}
  onChange={(e) =>
    setPasswordForm({
      ...passwordForm,
      confirmPassword: e.target.value
    })
  }
  mb="md"
/>


  <Group justify="flex-end">
    <Button
  onClick={changePassword}
  loading={passwordLoading}
  disabled={passwordLoading}
  loaderProps={{ size: "sm" }}
  style={{ backgroundColor: "black" }}
>
  {passwordLoading ? "Updating..." : "Change Password"}
</Button>
  </Group>
  
</Modal>


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
  <TextInput
  label="Status"
  value={form.status}
  onChange={(e) =>
    setForm({
      ...form,
      status: e.target.value,
    })
  }
  mb="sm"
/>

<TextInput
  label="Remarks"
  value={form.remarks}
  onChange={(e) =>
    setForm({
      ...form,
      remarks: e.target.value,
    })
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