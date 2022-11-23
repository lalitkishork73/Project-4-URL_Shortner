import React,{useState,useEffect} from 'react'
import axios from 'axios'

const Urlshorner = () => {

    const [url,setUrl]=useState("")
    const [out,setOut]=useState();
    const [outo,setOuto]=useState();
  
    let saveUser=()=>{
        try{

            axios({
                method: 'post',
                url: 'http://localhost:3001/url/shorten',
                headers: { 'Content-Type': 'application/json' },
                data: {
                    longUrl:url
                }
            }).then((responce=>{
                console.log(JSON.parse(JSON.stringify(responce.data.data))+"post responce")
                setOut(responce.data.data.shortUrl)
            }));
            
        }catch(err){
            console.log(err);
        }
          
        }   
    

    const sortUrl=(e)=>{
        e.preventDefault()
        console.log(saveUser()+"one")
    }
    let test=out
    console.log(test+"two")

    useEffect(() => {
       /*  axios({
            url: `http://localhost:3001`,
            params:{
                urlCode:test
            },
        }).then((responce=>{
            console.log(responce.data.data+"usseEff")
            setOuto(responce.data.data.urlCode)
        }))  */
             
    }, [])
    

  return (
    <>
        <div className='flex flex-col w-full h-screen'>
            <div className='flex justify-center bg-black/80 p-3'>
                <h1 className='text-2xl text-sky-400 font-bold'>Url Shortner</h1>
            </div>
            <div className='flex flex-col justify-center items-center h-[100%] w-[100%]'>
                <div className='flex flex-col justify-center items-center    border-black w-1/2 h-1/2 bg-gray-900/50 backdrop-blur-sm rounded-lg'> 
                        <h1 className='text-white font-bold mb-5'>Please Enter Your Long Url!</h1>
                        <input type="text" value={url} name="url" 
                        onChange={(e)=>setUrl(e.target.value)}
                        placeholder='paste URL' className="border-cyan-500 border-2 rounded-md p-1 w-[90%] bg-transparent text-white font-bold"  />
                        <a href={test} className='font-bold mt-6 text-center text-sky-400 cursor-pointer'>{out}</a>
                <div className='mt-9 p-3 flex flex-col md:flex-row'>
                    <button 
                    onClick={sortUrl}
                    className='border hover:bg-sky-500 hover:font-bold text-white p-2 rounded-md mr-1 bg-transparent'>Short Url</button>
                    <a className='border hover:bg-sky-500 hover:font-bold text-white p-2 rounded-md mr-1 bg-transparent' href={test} >Redirect</a>
                </div>
                </div>
            </div>

        </div>
    </>
  )
}

export default Urlshorner