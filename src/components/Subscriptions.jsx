import { Box, Button, Group, ScrollArea, Table, Text, Title } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks';
import React, { useState } from 'react'

const Subscriptions = () => {
      const [activeTab, setActiveTab] = useState('marketplace');
         const isMobile = useMediaQuery('(max-width: 768px)');
      

  return (
    <>
    <Text size='1.5rem' fw={"600"} pb={"1rem"} >Subscriptions</Text>
     <Group gap="md" mb="xl">
                <Button
                  size="md"
                  radius="xl"
                  style={{
                    backgroundColor: activeTab === 'marketplace' ? '#000000ff' : 'transparent',
                    color: activeTab === 'marketplace' ? 'white' : '#495057',
                    border: 'none',
                    fontWeight: 500,
                    paddingLeft: '28px',
                    paddingRight: '28px',
                  }}
                  onClick={() => setActiveTab('marketplace')}
                >
                  Active
                </Button>
                <Button
                  size="md"
                  radius="xl"
                  variant="subtle"
                  style={{
                    backgroundColor: activeTab === 'myStrategies' ? '#000000ff' : 'transparent',
                    color: activeTab === 'myStrategies' ? 'white' : '#495057',
                    border: 'none',
                    fontWeight: 500,
                    paddingLeft: '28px',
                    paddingRight: '28px',
                  }}
                  onClick={() => setActiveTab('myStrategies')}
                >
                  Expired
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
                       Strategy Name
                     </Table.Th>
                     <Table.Th style={{ color: '#868e96', fontWeight: 600, fontSize: '14px', padding: '16px',whiteSpace: "nowrap" }}>
                       Start date
                     </Table.Th>
                     <Table.Th style={{ color: '#868e96', fontWeight: 600, fontSize: '14px', padding: '16px',whiteSpace: "nowrap" }}>
                       Expiry date
                     </Table.Th>
                     <Table.Th style={{ color: '#868e96', fontWeight: 600, fontSize: '14px', padding: '16px',whiteSpace: "nowrap" }}>
                       Is Deployed
                     </Table.Th>
                   </Table.Tr>
                 </Table.Thead>
                 <Table.Tbody>
                   <Table.Tr>
                     <Table.Td colSpan={8} style={{ textAlign: 'center', padding: '60px', color: '#adb5bd' ,whiteSpace: "nowrap"}}>
                       <Text size="sm">No strategies available</Text>
                     </Table.Td>
                   </Table.Tr>
                 </Table.Tbody>
               </Table>
               </ScrollArea>
               </Box>
               </>
   
  )
}

export default Subscriptions