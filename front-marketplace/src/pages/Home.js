import React from 'react';
import Header from '../components/Auth/Header/Header';
import Footer from '../components/Auth/Footer/Footer';

function Home() {
  return (
    <div>
      <Header/>
      <h2>Home</h2>
      <p></p>
      <Footer initialOpenState={false}/>
    </div>
  );
}

export default Home;