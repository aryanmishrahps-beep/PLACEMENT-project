import { createContext, useContext, useState } from 'react';

const LiveStreamContext = createContext(null);

export const LiveStreamProvider = ({ children }) => {
  // Active live stream state
  const [activeStream, setActiveStream] = useState({
    isLive: true,
    id: 'stream-dsa-live',
    title: 'Data Structures & Algorithms: Master Graph Algorithms & Dynamic Programming',
    subject: 'DSA & DAA Masterclass',
    hostName: 'Dr. Rajesh Sharma (Head of CSE)',
    hostRole: 'Faculty',
    viewersCount: 42,
    streamType: 'webcam', // 'webcam' or 'youtube'
    youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    chatMessages: [
      { id: 1, sender: 'Priya Verma', role: 'Student', text: 'Good evening sir! Will we cover Dijkstra vs Bellman-Ford today?', time: '20:30' },
      { id: 2, sender: 'Amit Kumar', role: 'Student', text: 'Sir can you explain the space complexity of Floyd-Warshall again?', time: '20:31' },
      { id: 3, sender: 'Dr. Rajesh Sharma', role: 'Faculty', text: 'Yes Priya! We are covering Graph Shortest Paths right now.', time: '20:32' },
    ],
  });

  // Initial uploaded lectures library
  const [lectures, setLectures] = useState([
    {
      id: 'lec-1',
      title: 'Complete Guide to Dynamic Programming & Memoization',
      subject: 'DAA',
      faculty: 'Dr. Rajesh Sharma',
      date: '2026-08-05',
      duration: '45 mins',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1516116211223-4c59970a9310?auto=format&fit=crop&w=600&q=80',
      description: 'Master 1D and 2D DP patterns including Knapsack, LCS, and Matrix Chain Multiplication.',
      tags: ['DP', 'DAA', 'Algorithms']
    },
    {
      id: 'lec-2',
      title: 'Advanced Graph Theory: Tarjan & Kosaraju Algorithms',
      subject: 'DSA',
      faculty: 'Prof. Ananya Gupta',
      date: '2026-08-04',
      duration: '52 mins',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
      description: 'Deep dive into Strongly Connected Components (SCC), Topological Sorting, and Bridges.',
      tags: ['Graphs', 'DSA', 'Algorithms']
    },
    {
      id: 'lec-3',
      title: 'Mastering System Design & Distributed Systems',
      subject: 'System Design',
      faculty: 'Dr. Rajesh Sharma',
      date: '2026-08-02',
      duration: '60 mins',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
      description: 'High Availability, Load Balancing, Consistent Hashing, and Microservices Architecture.',
      tags: ['System Design', 'Placement Prep']
    }
  ]);

  // Start a new live stream
  const startLiveStream = (streamDetails) => {
    const newStream = {
      isLive: true,
      id: `stream-${Date.now()}`,
      title: streamDetails.title,
      subject: streamDetails.subject || 'Placement Special',
      hostName: streamDetails.hostName || 'Faculty',
      hostRole: 'Faculty',
      viewersCount: 1,
      streamType: streamDetails.streamType || 'webcam',
      youtubeUrl: streamDetails.youtubeUrl || '',
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      chatMessages: [
        { id: 1, sender: streamDetails.hostName || 'Faculty', role: 'Faculty', text: 'Welcome everyone! Live class has started.', time: 'Just now' }
      ]
    };
    setActiveStream(newStream);
  };

  // End active live stream
  const endLiveStream = () => {
    if (activeStream) {
      setActiveStream(prev => ({ ...prev, isLive: false }));
    }
  };

  // Add message to live chat
  const sendChatMessage = (senderName, role, messageText) => {
    if (!activeStream || !activeStream.isLive) return;
    const msg = {
      id: Date.now(),
      sender: senderName,
      role: role,
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setActiveStream(prev => ({
      ...prev,
      chatMessages: [...prev.chatMessages, msg]
    }));
  };

  // Upload a new video lecture
  const uploadLecture = (newLecture) => {
    const lectureObj = {
      id: `lec-${Date.now()}`,
      title: newLecture.title,
      subject: newLecture.subject || 'General',
      faculty: newLecture.faculty || 'Faculty',
      date: new Date().toISOString().split('T')[0],
      duration: newLecture.duration || '30 mins',
      videoUrl: newLecture.videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnail: newLecture.thumbnail || 'https://images.unsplash.com/photo-1516116211223-4c59970a9310?auto=format&fit=crop&w=600&q=80',
      description: newLecture.description || '',
      tags: newLecture.tags ? newLecture.tags.split(',').map(t => t.trim()) : ['Lecture']
    };
    setLectures(prev => [lectureObj, ...prev]);
  };

  return (
    <LiveStreamContext.Provider value={{
      activeStream,
      startLiveStream,
      endLiveStream,
      sendChatMessage,
      lectures,
      uploadLecture
    }}>
      {children}
    </LiveStreamContext.Provider>
  );
};

export const useLiveStream = () => {
  const context = useContext(LiveStreamContext);
  if (!context) throw new Error('useLiveStream must be used within LiveStreamProvider');
  return context;
};
