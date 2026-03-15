const axios = require('axios');

async function check() {
  try {
    const res = await axios.post('http://localhost:4000/api/v1/users/login', { email: 'admin@eduscale.io', password: 'password123' });
    const token = res.data.data.token;
	
    const out = await axios.get('http://localhost:4000/api/v1/roadmaps', { headers: { Authorization: `Bearer ${token}` }});
    const roadmapId = out.data.data.data.find(r => r.title === 'Full Stack Web Development Roadmap').id;
    
    const single = await axios.get(`http://localhost:4000/api/v1/roadmaps/${roadmapId}`, { headers: { Authorization: `Bearer ${token}` }});
    
    // We are looking for roadmap data now
    console.log(JSON.stringify(single.data.data.roadMap.main_concepts, null, 2).substring(0, 1000));
  } catch (err) {
    if (err.response) {
      console.log('Error', err.response.data);
    } else {
      console.log(err);
    }
  }
}
check();
