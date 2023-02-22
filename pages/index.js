import Head from 'next/head'
import Image from 'next/image'
import Collection from './components/collection'
import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

export default function Home() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Head>
        <title>Potatoz</title>
        <meta name="description" content="Potatoz Mint" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
        <link href="https://fonts.googleapis.com/css2?family=RocknRoll+One&display=block" rel="stylesheet" />
      </Head>


      <div className="bg-dark-900 w-screen h-full text-font-900 pt-24">
        <div className='text-center mb-6'>
          <h1 className='text-5xl'>Potatoz</h1>
          <span className='text-xl'>Mint</span>
          <Image src="/assets/potatoz.gif" alt="" className='mx-auto my-4 rounded-lg' width={100} height={100} style={{ width: '25vh' }} />
          <p className='text-md'>READY OR NOT 🎇 100 pixelated Potatoz arrived on BTC Chain</p>
          <p className='text-md'>Aim your Potatoz 👀 Go and get it!</p>
          <p className='text-md'>Mint your limited Potatoz before they run out.</p>
        </div>
        <Collection />
      </div>
      <Dialog
        fullWidth={true}
        maxWidth='sm'
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <DialogContent className='bg-font-900'>
          <div className='text-center'>

            <ol class="relative border-l border-white px-10">
              <li class="mb-10 ml-4">
                <div class="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white"></div>
                <h3 class="text-lg font-semibold text-gray-900 text-white">Step 1</h3>
                <p class="mb-4 text-base font-normal text-white">Choose your Potatoz to mint, make sure Potatoz status is Available to mint.</p>
                <img className='mx-auto' src='/assets/step/step1.jpg' style={{width: '30vh'}}/>
              </li>
              <li class="mb-10 ml-4">
                <div class="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white"></div>
                <h3 class="text-lg font-semibold text-gray-900 text-white">Step 2</h3>
                <p class="mb-4 text-base font-normal text-white">Fill your input address with your BTC Wallet Address, make payment by click "Pay" button, you will directly redirect to Payment link. (Complete the payment before the time runs out, the time limit is 10 minutes.)</p>
                <img className='mx-auto' src='/assets/step/step2.jpg' style={{width: '30vh'}}/>
                <img className='mx-auto' src='/assets/step/step3.jpg' style={{width: '30vh'}}/>
              </li>
              <li class="mb-10 ml-4">
                <div class="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white"></div>
                <h3 class="text-lg font-semibold text-gray-900 text-white">Step 4</h3>
                <p class="mb-4 text-base font-normal text-white">Your Potatoz will change to Pending status if you not finish your payment yet.</p>
              </li>
              <li class="ml-4">
                <div class="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white"></div>
                <h3 class="text-lg font-semibold text-gray-900 text-white">Step 5</h3>
                <p class="mb-4 text-base font-normal text-white">After payment is successful, your Potatoz status will changed to Minted. Now your Potatoz is all yours.</p>
                <img className='mx-auto' src='/assets/step/step5.jpg' style={{width: '30vh'}}/>
              </li>
            </ol>

          </div>
        </DialogContent >
      </Dialog >
    </div>
  )
}
