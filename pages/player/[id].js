
import { useRouter } from 'next/router'
import { Loader, Header, Container } from 'semantic-ui-react';
import Head from 'next/head';
import { getData } from '../api/dbCall'
import Stats from '../../src/component/Stats'

const Post = ({ data }) => {
    const router = useRouter();


    if (router.isFallback) {
        return (
            <div style={{ padding: "300px 0" }}>
                <Loader inline="centered" active>
                    Loading
                </Loader>
            </div>
        )
    }
    return (
        <>

            {data && (
                <>
                    <Head>
                        <title>{data.name}</title>
                        <meta name='description' content={data.currentTier}></meta>
                    </Head>
                    <Stats  player={data}></Stats>


                </>
            )
            }

        </>
    );
}


export async function getServerSideProps(context) {
    const name = context.params.id;
    
    // const res = await Axios.post('http://localhost:3000/api/dbCall', { player: { name } });
    // const data = res.data.data;
    const data = await getData(name);
    //console.log(data);
    return {
        props: {
            data: data,
        },
    };

}

export default Post;