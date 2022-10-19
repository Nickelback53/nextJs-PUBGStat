import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { Divider, Header, Loader, Form ,Button,  Grid, Input} from 'semantic-ui-react';
import Axios from 'axios';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import RankList from '../src/component/RankList';



export default function Home({ savedData }) {
  const [name, setName] = useState('');
  const [data, setData] = useState([]);
  const [isLoding, setIsLoding] = useState(false);
  const router = useRouter();

  //const res2 = Axios.post('/api/pubgAPI',{ player:'dators'});
  //const res =  Axios.get('/api/pubgAPI' );
  //console.log(res);



  async function handleSubmit(e) {
    setIsLoding(true);
    // setName(e.target.value);
    // console.log(e.target.value);
    await Axios.post('/api/apiCall', { player: { name } }).then(res => {
      let copy = [...res.data.data];
      setData(copy);
      setIsLoding(false);
      //console.log(copy);
    });


    //router.push('/rank');
  }
  // async function apiCall(e) {

  //   await Axios.post('/api/apiCall', { player: { name } }).then(res => {
  //     let copy = [...res.data.data ];
  //     setData(copy);
  //     console.log(copy);
  //   });


  //   //router.push('/rank');
  // }
  function handleChange(e) {
    localStorage.setItem('name', JSON.stringify(e.target.value));
    setName(e.target.value)
  };

  useEffect(() => {
    setName(JSON.parse(localStorage.getItem('name')));
  }, [])
  return (
    <div >
      <Head>
        <title>Home | 7Cloud</title>
        <meta name='description' content='홈 입니다.'></meta>
      </Head>
      <Header textAlign='center' as="h3" style={{ paddingTop: 40, marginBottom: 40 }}  >스쿼드 검색</Header>
      <Grid centered width={8}>
        {/* <Form onSubmit={handleSubmit} >
          <Form.Group>
            <Form.Input
              placeholder='아이디를 ,로 구분해서 입력하세요'
              name='name'
              value={name}
              onChange={handleChange}
              style={{ width: 500  , marginBottom: 40 }}
            />
            <Form.Button content='검색' />
          </Form.Group>
        </Form> */}
        <Input type='text'  action='검색' placeholder='아이디를 ,로 구분해서 입력하세요' style={{ width: 500, marginBottom: 40 }}>
          <input onChange={handleChange}/>
          <Button type='submit' onClick={handleSubmit}>Search</Button>
        </Input>
      </Grid>
      {isLoding && (
        <div style={{ padding: "300px 0" }}>
          <Loader inline="centered" active>
            Loading
          </Loader>
        </div>
      )}
      {!isLoding && (
        <RankList data={data} />
      )

      }

    </div>
  )
}

