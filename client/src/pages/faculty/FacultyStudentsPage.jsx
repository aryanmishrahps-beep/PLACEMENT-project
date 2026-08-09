import ProtectedLayout from '../../components/layout/ProtectedLayout';
import { useState } from 'react';

export default function FacultyStudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('All');

  const mockStudents = [
    { id: 1, name: 'AADARSH KHANDURI', rollNo: '24BTCSECS1001', erpId: '24040541001', batch: '2028', progress: 95 },
    { id: 2, name: 'ABHAY KUMAR', rollNo: '24BTCSEAI0133', erpId: '2404053001', batch: '2028', progress: 82 },
    { id: 3, name: 'ABHI JAISWAL', rollNo: '24BTCSEAI0132', erpId: '2404053003', batch: '2028', progress: 76 },
    { id: 4, name: 'ABHINANDAN ROY', rollNo: '24BTCSECS0010', erpId: '2404054001', batch: '2028', progress: 88 },
    { id: 5, name: 'ABHISHEK BELWAL', rollNo: '24BTCSEAI0096', erpId: '2404053005', batch: '2028', progress: 64 },
    { id: 6, name: 'ABHISHEK RAWAT', rollNo: '24BTCSECS1005', erpId: '25040541002', batch: '2028', progress: 91 },
    { id: 7, name: 'ACHYUT SHARMA', rollNo: '24BTCSEAI0177', erpId: '2404053008', batch: '2028', progress: 73 },
    { id: 8, name: 'ADITYA PANDEY', rollNo: '24BTCSECS0019', erpId: '2404054003', batch: '2028', progress: 85 },
    { id: 9, name: 'AJAY GUNWANT', rollNo: '24BTCSEAI0104', erpId: '2404053014', batch: '2028', progress: 59 },
    { id: 10, name: 'AKANKSHA RAI', rollNo: '24BTCSEAI0143', erpId: '2404053015', batch: '2028', progress: 92 },
    { id: 11, name: 'AKASH KUMAR NISHAD', rollNo: '24BTCSEAI0147', erpId: '2404053017', batch: '2028', progress: 81 },
    { id: 12, name: 'ANANYA DHIMAN', rollNo: '24BTCSECS0031', erpId: '2404053022', batch: '2028', progress: 77 },
    { id: 13, name: 'ANKIT KUMAR PANDIT', rollNo: '24BTCSEAI0111', erpId: '2404053025', batch: '2028', progress: 68 },
    { id: 14, name: 'ANKIT PANDEY', rollNo: '24BTCSEAI0025', erpId: '2404053026', batch: '2028', progress: 84 },
    { id: 15, name: 'ANKIT PANDEY', rollNo: '24BTCSEAI0074', erpId: '2404053027', batch: '2028', progress: 72 },
    { id: 16, name: 'ANURAG PARIHAR', rollNo: '24BTCSEAI0127', erpId: '2404053030', batch: '2028', progress: 89 },
    { id: 17, name: 'ARPIT KAMBOJ', rollNo: '24BTCSEAI0123', erpId: '2404053032', batch: '2028', progress: 61 },
    { id: 18, name: 'ASHIKA VERMA', rollNo: '24BTCSEAI0124', erpId: '2404053034', batch: '2028', progress: 96 },
    { id: 19, name: 'ATUL VASHISHTH', rollNo: '24BTCSECS1003', erpId: '25040541003', batch: '2028', progress: 75 },
    { id: 20, name: 'DANISH KUMAR', rollNo: '24BTCSECS0034', erpId: '2404053038', batch: '2028', progress: 83 },
    { id: 21, name: 'DHIRAJ KUMAR', rollNo: '24BTCSEAI1002', erpId: '25030291001', batch: '2028', progress: 70 },
    { id: 22, name: 'DIKSHA CHAUHAN', rollNo: '24BTCSEAI0109', erpId: '2404053044', batch: '2028', progress: 88 },
    { id: 23, name: 'DIKSHA JOSHI', rollNo: '24BTCSEAI0179', erpId: '2404049100', batch: '2028', progress: 100 },
    { id: 24, name: 'DIPALI PANDEY', rollNo: '24BTCSECS0029', erpId: '2404053045', batch: '2028', progress: 94 },
    { id: 25, name: 'GAURAV JOSHI', rollNo: '24BTCSEAI0152', erpId: '2404053046', batch: '2028', progress: 79 },
    { id: 26, name: 'GAURAV KUMAR', rollNo: '24BTCSEAI0099', erpId: '2404053047', batch: '2028', progress: 65 },
    { id: 27, name: 'GUNANK DUTT TIWARI', rollNo: '24BTCSEAI0114', erpId: '2404053049', batch: '2028', progress: 86 },
    { id: 28, name: 'GUNJAN', rollNo: '24BTCSECS0030', erpId: '2404049113', batch: '2028', progress: 71 },
    { id: 29, name: 'GURMEET SINGH', rollNo: '24BTCSEAI0172', erpId: '2404053050', batch: '2028', progress: 82 },
    { id: 30, name: 'GURVINDER SINGH', rollNo: '24BTCSEAI1004', erpId: '25030291002', batch: '2028', progress: 78 },
    { id: 31, name: 'HARDIK', rollNo: '24BTCSECS0025', erpId: '2404054004', batch: '2028', progress: 90 },
    { id: 32, name: 'HARSH AARYAN', rollNo: '24BTCSECS0009', erpId: '2404054005', batch: '2028', progress: 87 },
    { id: 33, name: 'HARSH FARTYAL', rollNo: '24BTCSECS0020', erpId: '2404054006', batch: '2028', progress: 93 },
    { id: 34, name: 'HARSH NISHANT', rollNo: '24BTCSECS0022', erpId: '2404054007', batch: '2028', progress: 69 },
    { id: 35, name: 'HARSHIT', rollNo: '24BTCSEAI1008', erpId: '25030291003', batch: '2028', progress: 85 },
    { id: 36, name: 'HASAN ALI KHAN', rollNo: '24BTCSECS0012', erpId: '2404054008', batch: '2028', progress: 74 },
    { id: 37, name: 'HIMADRI BISHT', rollNo: '24BTCSEAI0110', erpId: '2404053052', batch: '2028', progress: 91 },
    { id: 38, name: 'JASSI KUMARI', rollNo: '24BTCSEAI0145', erpId: '2404053059', batch: '2028', progress: 80 },
    { id: 39, name: 'JATIN PANT', rollNo: '24BTCSECS0014', erpId: '2404054009', batch: '2028', progress: 45 },
    { id: 40, name: 'KARTIKEYA KUSHWAH', rollNo: '24BTCSEAI0151', erpId: '2404053060', batch: '2028', progress: 88 },
    { id: 41, name: 'KRRISH ANAND', rollNo: '24BTCSEAI0180', erpId: '2404049143', batch: '2028', progress: 77 },
    { id: 42, name: 'KUNAL GAURAV', rollNo: '24BTCSECS0002', erpId: '2404054010', batch: '2028', progress: 68 },
    { id: 43, name: 'KUNJ SODHI', rollNo: '24BTCSEAI0103', erpId: '2404053065', batch: '2028', progress: 95 },
    { id: 44, name: 'LOVENEESH', rollNo: '24BTCSEAI1009', erpId: '25030291004', batch: '2028', progress: 62 },
    { id: 45, name: 'MADHAV SHARMA', rollNo: '24BTCSECS0005', erpId: '2404054011', batch: '2028', progress: 84 },
    { id: 46, name: 'MANAN SINGH BHANDA', rollNo: '24BTCSECS0024', erpId: '2404054012', batch: '2028', progress: 79 },
    { id: 47, name: 'MANVEER SINGH', rollNo: '24BTCSEAI0175', erpId: '2404053071', batch: '2028', progress: 81 },
    { id: 48, name: 'MUKUND MADHAV', rollNo: '24BTCSEAI0130', erpId: '2404053076', batch: '2028', progress: 90 },
    { id: 49, name: 'MUSKAN KUMARI', rollNo: '24BTCSEAI0106', erpId: '2404053077', batch: '2028', progress: 86 },
    { id: 50, name: 'NEELESH MURARI', rollNo: '24BTCSECS1004', erpId: '25040541004', batch: '2028', progress: 73 },
    { id: 51, name: 'NIKET', rollNo: '24BTCSEAI0125', erpId: '2404053079', batch: '2028', progress: 78 },
    { id: 52, name: 'PARAS JOSHI', rollNo: '24BTCSEAI0102', erpId: '2404053082', batch: '2028', progress: 82 },
    { id: 53, name: 'PAWAN KUMAR', rollNo: '24BTCSECS0008', erpId: '2404054013', batch: '2028', progress: 95 },
    { id: 54, name: 'PAYAL KORANGA', rollNo: '24BTCSEAI0134', erpId: '2404053084', batch: '2028', progress: 64 },
    { id: 55, name: 'PIYUSH KUMAR SINHA', rollNo: '24BTCSEAI0030', erpId: '2404053087', batch: '2028', progress: 88 },
    { id: 56, name: 'PIYUSH RANA', rollNo: '24BTCSEAI0138', erpId: '2404053088', batch: '2028', progress: 76 },
    { id: 57, name: 'PRASHANT KUMAR', rollNo: '24BTCSEAI0059', erpId: '2404053089', batch: '2028', progress: 91 },
    { id: 58, name: 'PRINCE BHARDWAJ', rollNo: '24BTCSEAI0167', erpId: '2404053091', batch: '2028', progress: 72 },
    { id: 59, name: 'PRINCY CHAUHAN', rollNo: '24BTCSECS0027', erpId: '2404054014', batch: '2028', progress: 85 },
    { id: 60, name: 'PRIYANSHU RAJ', rollNo: '24BTCSEAI0153', erpId: '2404053092', batch: '2028', progress: 69 },
    { id: 61, name: 'PURNABRATA MONDAL', rollNo: '24BTCSECS0011', erpId: '2404054015', batch: '2028', progress: 81 },
    { id: 62, name: 'RAHUL BISHT', rollNo: '24BTCSEAI0116', erpId: '2404053095', batch: '2028', progress: 74 },
    { id: 63, name: 'RAJNI GARIYA', rollNo: '24BTCSEAI0135', erpId: '2404053096', batch: '2028', progress: 93 },
    { id: 64, name: 'RAVI KUMAR', rollNo: '24BTCSECS0015', erpId: '2404054016', batch: '2028', progress: 68 },
    { id: 65, name: 'RINKI', rollNo: '24BTCSEAI0105', erpId: '2404053100', batch: '2028', progress: 87 },
    { id: 66, name: 'RISHU RAJ', rollNo: '24BTCSECS0023', erpId: '2404054017', batch: '2028', progress: 79 },
    { id: 67, name: 'RITIKA MEHRA', rollNo: '24BTCSEAI0112', erpId: '2404053102', batch: '2028', progress: 96 },
    { id: 68, name: 'RIYA CHAUHAN', rollNo: '24BTCSECS0017', erpId: '2404054018', batch: '2028', progress: 83 },
    { id: 69, name: 'RUDRA ANEJA', rollNo: '24BTCSECS0016', erpId: '2404054019', batch: '2028', progress: 70 },
    { id: 70, name: 'SAIFULLAH AHAD', rollNo: '24BTCSEAI0144', erpId: '2404053105', batch: '2028', progress: 88 },
    { id: 71, name: 'SAINA', rollNo: '24BTCSEAI0117', erpId: '2404053107', batch: '2028', progress: 61 },
    { id: 72, name: 'SATYAM KUMAR', rollNo: '24BTCSECS0032', erpId: '2404053109', batch: '2028', progress: 94 },
    { id: 73, name: 'SAYAN DE', rollNo: '24BTCSECS0033', erpId: '2404053110', batch: '2028', progress: 75 },
    { id: 74, name: 'SHAGUN SALAL', rollNo: '24BTCSEAI0119', erpId: '2404053111', batch: '2028', progress: 89 },
    { id: 75, name: 'SHAILESH KUMAR', rollNo: '24BTCSEAI0149', erpId: '2404053112', batch: '2028', progress: 65 },
    { id: 76, name: 'SHIVANSH DUBEY', rollNo: '24BTCSEAI0113', erpId: '2404053114', batch: '2028', progress: 86 },
    { id: 77, name: 'SHOAIB ANSARI', rollNo: '24BTCSEAI0178', erpId: '2404053117', batch: '2028', progress: 71 },
    { id: 78, name: 'SHREYANSHI TIWARI', rollNo: '24BTCSECS0028', erpId: '2404053119', batch: '2028', progress: 82 },
    { id: 79, name: 'SHUBHAM RAJ SUNDAR', rollNo: '24BTCSECS0006', erpId: '2404054021', batch: '2028', progress: 78 },
    { id: 80, name: 'SUDHANSHU KUMAR', rollNo: '24BTCSEAI0101', erpId: '2404053122', batch: '2028', progress: 90 },
    { id: 81, name: 'SUHANI ADHIKARI', rollNo: '24BTCSECS0026', erpId: '2404054022', batch: '2028', progress: 87 },
    { id: 82, name: 'SURAJ KUMAR OZHA', rollNo: '24BTCSECS0003', erpId: '2404054023', batch: '2028', progress: 93 },
    { id: 83, name: 'SUYASH BISHT', rollNo: '24BTCSEAI0121', erpId: '2404053127', batch: '2028', progress: 69 },
    { id: 84, name: 'TANISHQ SINGH', rollNo: '24BTCSEAI0159', erpId: '2404053128', batch: '2028', progress: 85 },
    { id: 85, name: 'TUSHAR PATEL', rollNo: '24BTCSEAI0148', erpId: '2404053130', batch: '2028', progress: 74 },
    { id: 86, name: 'VAIBHAV', rollNo: '24BTCSEAI0140', erpId: '2404053134', batch: '2028', progress: 91 },
    { id: 87, name: 'VAIBHAV PRAJAPATI', rollNo: '24BTCSEAI0120', erpId: '2404053135', batch: '2028', progress: 80 },
    { id: 88, name: 'VANSH MALIK', rollNo: '24BTCSECS0013', erpId: '2404054024', batch: '2028', progress: 45 },
    { id: 89, name: 'VARUN PADHA', rollNo: '24BTCSEAI0128', erpId: '2404053137', batch: '2028', progress: 88 },
    { id: 90, name: 'VIKASH KUMAR GUPTA', rollNo: '24BTCSECS0007', erpId: '2404054025', batch: '2028', progress: 77 },
    { id: 91, name: 'AARTI', rollNo: '24BTCSE0423', erpId: '24040540423', batch: '2028', progress: 78 },
    { id: 92, name: 'AASTHA KUMARI', rollNo: '24BTCSE0114', erpId: '24040540114', batch: '2028', progress: 70 },
    { id: 93, name: 'ABHIMANYU KUMAR', rollNo: '24BTCSE0027', erpId: '24040540027', batch: '2028', progress: 92 },
    { id: 94, name: 'ABHINAV CHAUHAN', rollNo: '24BTCSE0074', erpId: '24040540074', batch: '2028', progress: 82 },
    { id: 95, name: 'ABHINAV SINGH', rollNo: '24BTCSE0066', erpId: '24040540066', batch: '2028', progress: 54 },
    { id: 96, name: 'ABHISHEK SINGH RAWAT', rollNo: '24BTCSE0073', erpId: '24040540073', batch: '2028', progress: 74 },
    { id: 97, name: 'ADITYA KUMAR', rollNo: '24BTCSE0084', erpId: '24040540084', batch: '2028', progress: 60 },
    { id: 98, name: 'ADITYA MISHRA', rollNo: '24BTCSE0233', erpId: '24040540233', batch: '2028', progress: 79 },
    { id: 99, name: 'ADITYA RAJ', rollNo: '24BTCSE0080', erpId: '24040540080', batch: '2028', progress: 93 },
    { id: 100, name: 'AJAY KUMAR', rollNo: '24BTCSE0425', erpId: '24040540425', batch: '2028', progress: 71 },
    { id: 101, name: 'AJEET KUMAR', rollNo: '24BTCSE0360', erpId: '24040540360', batch: '2028', progress: 58 },
    { id: 102, name: 'AKANKSHA KUMARI', rollNo: '24BTCSE0060', erpId: '24040540060', batch: '2028', progress: 94 },
    { id: 103, name: 'AKSHAY PRATAP SINGH', rollNo: '24BTCSE0421', erpId: '24040540421', batch: '2028', progress: 86 },
    { id: 104, name: 'ALOK KUMAR', rollNo: '24BTCSE0030', erpId: '24040540030', batch: '2028', progress: 62 },
    { id: 105, name: 'ALOK RAJ', rollNo: '24BTCSE0424', erpId: '24040540424', batch: '2028', progress: 56 },
    { id: 106, name: 'ANISH PRAJAPATI', rollNo: '24BTCSE0193', erpId: '24040540193', batch: '2028', progress: 73 },
    { id: 107, name: 'ANKIT LAKHCHAURA', rollNo: '24BTCSE0285', erpId: '24040540285', batch: '2028', progress: 83 },
    { id: 108, name: 'ANKUR JAISWAL', rollNo: '24BTCSE0365', erpId: '24040540365', batch: '2028', progress: 79 },
    { id: 109, name: 'ANSH', rollNo: '24BTCSE0430', erpId: '24040540430', batch: '2028', progress: 45 },
    { id: 110, name: 'ANSHVEER SINGH CHAUHAN', rollNo: '24BTCSE0388', erpId: '24040540388', batch: '2028', progress: 71 },
    { id: 111, name: 'ARHAN AHMED', rollNo: '24BTCSE0022', erpId: '24040540022', batch: '2028', progress: 91 },
    { id: 112, name: 'ARYAN KUMAR', rollNo: '24BTCSE0028', erpId: '24040540028', batch: '2028', progress: 47 },
    { id: 113, name: 'ARYAN MISHRA', rollNo: '24BTCSE0072', erpId: '24040540072', batch: '2028', progress: 78 },
    { id: 114, name: 'ASAD', rollNo: '24BTCSE0398', erpId: '24040540398', batch: '2028', progress: 46 },
    { id: 115, name: 'ASHISH KUMAR', rollNo: '24BTCSE0396', erpId: '24040540396', batch: '2028', progress: 59 },
    { id: 116, name: 'ASHUTOSH KUMAR', rollNo: '24BTCSE0044', erpId: '24040540044', batch: '2028', progress: 48 },
    { id: 117, name: 'ASHUTOSH SINGH', rollNo: '24BTCSE0419', erpId: '24040540419', batch: '2028', progress: 55 },
    { id: 118, name: 'AVIKA AWASTHI', rollNo: '24BTCSE0157', erpId: '24040540157', batch: '2028', progress: 88 },
    { id: 119, name: 'CHAMAN KUMAR', rollNo: '24BTCSE0005', erpId: '24040540005', batch: '2028', progress: 74 },
    { id: 120, name: 'CHETAN PAL', rollNo: '24BTCSE0029', erpId: '24040540029', batch: '2028', progress: 46 },
    { id: 121, name: 'DIVYANSHU', rollNo: '24BTCSE0273', erpId: '24040540273', batch: '2028', progress: 54 },
    { id: 122, name: 'DIYA KAPOOR', rollNo: '24BTCSE0095', erpId: '24040540095', batch: '2028', progress: 92 },
    { id: 123, name: 'FAIZ KHAN', rollNo: '24BTCSE0402', erpId: '24040540402', batch: '2028', progress: 72 },
    { id: 124, name: 'GAURAV SINGH MISHRAWAN', rollNo: '24BTCSE0429', erpId: '24040540429', batch: '2028', progress: 90 },
    { id: 125, name: 'HARSHITA', rollNo: '24BTCSE0031', erpId: '24040540031', batch: '2028', progress: 62 },
    { id: 126, name: 'HEMA KUMARI', rollNo: '24BTCSE0057', erpId: '24040540057', batch: '2028', progress: 70 },
    { id: 127, name: 'HIMANSHU GHOSH', rollNo: '24BTCSE0045', erpId: '24040540045', batch: '2028', progress: 47 },
    { id: 128, name: 'HIMANSHU KANDPAL', rollNo: '24BTCSE0439', erpId: '24040540439', batch: '2028', progress: 47 },
    { id: 129, name: 'HIMANSHU KUMAR CHOUBEY', rollNo: '24BTCSE0014', erpId: '24040540014', batch: '2028', progress: 76 },
    { id: 130, name: 'JAY RAJBHAR', rollNo: '24BTCSE0019', erpId: '24040540019', batch: '2028', progress: 78 },
    { id: 131, name: 'MD AMAN ALAM', rollNo: '24BTCSE0042', erpId: '24040540042', batch: '2028', progress: 58 },
    { id: 132, name: 'MISHIKA CHAUHAN', rollNo: '24BTCSE0086', erpId: '24040540086', batch: '2028', progress: 81 },
    { id: 133, name: 'MOHD SAKIB', rollNo: '24BTCSE0024', erpId: '24040540024', batch: '2028', progress: 56 },
    { id: 134, name: 'MOHIT SHARMA', rollNo: '24BTCSE0061', erpId: '24040540061', batch: '2028', progress: 62 },
    { id: 135, name: 'MONIKA', rollNo: '24BTCSE0075', erpId: '24040540075', batch: '2028', progress: 86 },
    { id: 136, name: 'NEHA KUMARI', rollNo: '24BTCSE0026', erpId: '24040540026', batch: '2028', progress: 93 },
    { id: 137, name: 'PANKAJ RAI', rollNo: '24BTCSE0059', erpId: '24040540059', batch: '2028', progress: 73 },
    { id: 138, name: 'PIYUSH RANJAN', rollNo: '24BTCSE0111', erpId: '24040540111', batch: '2028', progress: 56 },
    { id: 139, name: 'PRANJAL NEGI', rollNo: '24BTCSE0082', erpId: '24040540082', batch: '2028', progress: 60 },
    { id: 140, name: 'PRASHANT SINGH', rollNo: '24BTCSE0037', erpId: '24040540037', batch: '2028', progress: 61 },
    { id: 141, name: 'PRIYANSHU KUMAR', rollNo: '24BTCSE0085', erpId: '24040540085', batch: '2028', progress: 49 },
    { id: 142, name: 'RAHUL KUMAR', rollNo: '24BTCSE0081', erpId: '24040540081', batch: '2028', progress: 81 },
    { id: 143, name: 'RAJAT KISHORE', rollNo: '24BTCSE0039', erpId: '24040540039', batch: '2028', progress: 83 },
    { id: 144, name: 'RIDDHIMA KAR', rollNo: '24BTCSE0048', erpId: '24040540048', batch: '2028', progress: 83 },
    { id: 145, name: 'RISHABH SINGH', rollNo: '24BTCSE0255', erpId: '24040540255', batch: '2028', progress: 96 },
    { id: 146, name: 'RISHAV KUMAR', rollNo: '24BTCSE0070', erpId: '24040540070', batch: '2028', progress: 49 },
    { id: 147, name: 'RISHU RAJ', rollNo: '24BTCSE0103', erpId: '24040540103', batch: '2028', progress: 97 },
    { id: 148, name: 'SAHIL GAURAB RAY', rollNo: '24BTCSE0002', erpId: '24040540002', batch: '2028', progress: 69 },
    { id: 149, name: 'SANKET MUKHERJEE', rollNo: '24BTCSE0098', erpId: '24040540098', batch: '2028', progress: 97 },
    { id: 150, name: 'SATYAM DHAR DUBEY', rollNo: '24BTCSE0112', erpId: '24040540112', batch: '2028', progress: 52 },
    { id: 151, name: 'SHIVAM KUMAR', rollNo: '24BTCSE0361', erpId: '24040540361', batch: '2028', progress: 51 },
    { id: 152, name: 'SIMRAN', rollNo: '24BTCSE0034', erpId: '24040540034', batch: '2028', progress: 45 },
    { id: 153, name: 'SUMIT KUMAR SINGH', rollNo: '24BTCSE0150', erpId: '24040540150', batch: '2028', progress: 65 },
    { id: 154, name: 'SWAICHHA SAUD', rollNo: '24BTCSE0063', erpId: '24040540063', batch: '2028', progress: 71 },
    { id: 155, name: 'TUSHAR VARSHNEY', rollNo: '24BTCSE0115', erpId: '24040540115', batch: '2028', progress: 79 },
    { id: 156, name: 'VAIBHAV SUNDRIYAL', rollNo: '24BTCSE0432', erpId: '24040540432', batch: '2028', progress: 95 },
    { id: 157, name: 'VAIBHAV CHAUHAN', rollNo: '24BTCSE0078', erpId: '24040540078', batch: '2028', progress: 49 },
    { id: 158, name: 'VANSH', rollNo: '24BTCSE0092', erpId: '24040540092', batch: '2028', progress: 85 },
    { id: 159, name: 'VANSH GIRIRAJ', rollNo: '24BTCSE0113', erpId: '24040540113', batch: '2028', progress: 97 },
    { id: 160, name: 'VIPUL SHARMA', rollNo: '24BTCSE0046', erpId: '24040540046', batch: '2028', progress: 60 },
    { id: 161, name: 'VISHAL KUMAR', rollNo: '24BTCSE0036', erpId: '24040540036', batch: '2028', progress: 84 },
    { id: 162, name: 'VIVEK JHA', rollNo: '24BTCSE0149', erpId: '24040540149', batch: '2028', progress: 55 },
  ];

  const filteredStudents = mockStudents.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = s.name.toLowerCase().includes(q) || 
                          s.rollNo.toLowerCase().includes(q) || 
                          s.erpId.toLowerCase().includes(q);
    const section = s.id <= 90 ? 'E' : 'A';
    const matchesSection = selectedSection === 'All' || section === selectedSection;
    return matchesSearch && matchesSection;
  });

  const handleExportCSV = () => {
    const headers = ['Name', 'Roll No.', 'ERP ID', 'Section', 'Batch', 'Course Progress (%)'];
    const rows = filteredStudents.map(s => [
      s.name,
      s.rollNo,
      s.erpId,
      s.id <= 90 ? 'Section E' : 'Section A',
      s.batch,
      `${s.progress}%`
    ]);
    
    const csvContent = [headers, ...rows]
      .map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
      .join("\n");
      
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `student_directory_section_${selectedSection.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ProtectedLayout title="Student Directory" allowedRoles={['faculty']}>
      <div className="card">
        <div className="flex justify-between items-center mb-md flex-wrap gap-md">
          <div className="flex items-center gap-md">
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by name, roll no, or ERP ID..." 
              style={{ maxWidth: '300px' }} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select 
              className="form-select" 
              style={{ minWidth: '150px' }}
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              <option value="All">All Sections</option>
              <option value="A">Section A</option>
              <option value="E">Section E</option>
            </select>
          </div>
          <button className="btn btn-secondary" onClick={handleExportCSV}>Export CSV</button>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll No.</th>
              <th>ERP ID</th>
              <th>Section</th>
              <th>Batch</th>
              <th>Course Progress</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map(s => (
                <tr key={s.id}>
                  <td className="font-semibold text-primary">{s.name}</td>
                  <td>{s.rollNo}</td>
                  <td>{s.erpId}</td>
                  <td>{s.id <= 90 ? 'Section E' : 'Section A'}</td>
                  <td>{s.batch}</td>
                  <td style={{ minWidth: '150px' }}>
                    <div className="flex items-center gap-sm">
                      <div className="progress-bar-container flex-1" style={{ height: '8px' }}>
                        <div className="progress-bar-fill" style={{ width: `${s.progress}%`, background: s.progress > 80 ? 'var(--color-accent)' : s.progress < 50 ? 'var(--color-danger)' : 'var(--color-primary)' }} />
                      </div>
                      <span className="text-xs font-bold">{s.progress}%</span>
                    </div>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-secondary">View Profile</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>No students found matching "{searchQuery}"</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ProtectedLayout>
  );
}
