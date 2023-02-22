import { supabase } from '../../resources/config';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

function Collection() {
    const [load, setLoad] = useState('default');
    const [address, setAddress] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [selectedId, setSelectedId] = useState('');
    const [open, setOpen] = useState(false);
    const [openGuide, setOpenGuide] = useState(false);
    const [filter, setFilter] = useState('available');
    const [remaining, setRemaining] = useState(0);
    const [recordData, setRecordData] = useState([]);


    const useCountdown = (deadline) => {
        // Time is in seconds
        const [time, setTime] = useState(
            Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 1000))
        );

        const decrement = () =>
            setTime((prevTime) => {
                return prevTime === 0 ? 0 : prevTime - 1;
            });

        useEffect(() => {
            const id = setInterval(decrement, 1000);
            return () => clearInterval(id);
        }, []);

        const format = (num) => {
            return num < 10 ? '0' + num : num.toString();
        };

        return {
            days: format(Math.floor(time / (3600 * 24))),
            hours: format(Math.floor((time / 3600) % 24)),
            minutes: format(Math.floor((time / 60) % 60)),
            seconds: format(time % 60),
        };
    };

    const hour = 3.6e6; // 1 Hour in milliseconds
    const numHours = 50; // Number of hours in the future
    const [deadline] = useState(new Date(Date.now() + numHours * hour));
    const time = useCountdown(deadline);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const fetchDataRemaining = async () => {
        const { count } = await supabase.from('mint_record').select('*', { count: 'exact' }).eq('status', 'minted');
        setRemaining(Number(100) - count);
    };

    const fetchData = async () => {
        if (filter === 'all') {
            const { data } = await supabase.from('mint_record').select().order('id');
            setRecordData(data);
        } else {
            const { data } = await supabase.from('mint_record').select().eq('status', filter).order('id');
            setRecordData(data);
        }
    };

    const handleMint = async (tag, id) => {
        setLoad('checking');
        try {
            const { data } = await supabase.from('mint_record').select().eq('tag', tag);
            if (data[0].status === 'available') {
                setLoad('ready');
                const options = {
                    method: 'POST',
                    headers: {
                        accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: process.env.NEXT_PUBLIC_AUTH
                    },
                    body: JSON.stringify({
                        amount: 600000,
                        currency: 'BTC',
                        description: `${address}`,
                        ttl: 10
                    })
                };

                fetch('https://api.opennode.com/v1/charges', options)
                    .then(response => response.json())
                    .then(response => {
                        console.log(response.data.id);
                        console.log(id);
                        setData(address, response.data.id, id).then(() => {
                            fetchData();
                            setLoad('default');
                            setOpen(false);
                            window.open(response.data.hosted_checkout_url);
                        })
                    })
                    .catch(err => console.error(err));
            } else {
                setLoad('pending');
                fetchData();
            }
        } catch (err) {
            console.log(err);
            setLoad('default');
            fetchData();
        }
    };

    const setData = async (wallet, payment_id, id) => {
        try {
            let status = 'pending';
            await supabase
                .from('mint_record')
                .update([
                    {
                        payment_id,
                        wallet,
                        status
                    }
                ])
                .eq('id', id);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchDataRemaining();
    }, []);

    useEffect(() => {
        fetchData();
    }, [filter]);

    return (
        <div className='max-w-6xl 2xl:max-w-7xl mx-auto pb-24'>
            <div className='flex justify-center w-full space-x-4'>
                <div className='text-center mb-4'>
                    <span>Remaining</span>
                    <p>{remaining}/100</p>
                </div>
                {/* <div className='text-center mb-4'>
                    <span>Price</span>
                    <p>0.006</p>
                </div> */}
            </div>
            <div className='md:flex px-8 md:px-0 items-center md:space-x-2 justify-center pb-6'>
                <p className='pb-2 md:pb-0'>Filter by: </p>
                <ul class="grid gap-2 md:gap-4 md:grid-cols-4">
                    <li>
                        <input type="radio" onChange={(e) => { setFilter(e.target.value) }} id="available" name="filter" value="available" class="hidden peer" defaultChecked />
                        <label for="available" class="text-sm inline-flex items-center justify-center w-full px-6 py-2 text-white bg-transparent border border-font-900 rounded-lg cursor-pointer  peer-checked:border-font-900 peer-checked:text-font-900 hover:text-gray-600  ">
                            Available
                        </label>
                    </li>
                    <li>
                        <input type="radio" onChange={(e) => { setFilter(e.target.value) }} id="pending" name="filter" value="pending" class="hidden peer" />
                        <label for="pending" class="text-sm inline-flex items-center justify-center w-full px-6 py-2 text-white bg-transparent border border-font-900 rounded-lg cursor-pointer  peer-checked:border-font-900 peer-checked:text-font-900 hover:text-gray-600  ">
                            Pending
                        </label>
                    </li>
                    <li>
                        <input type="radio" onChange={(e) => { setFilter(e.target.value) }} id="minted" name="filter" value="minted" class="hidden peer" />
                        <label for="minted" class="text-sm inline-flex items-center justify-center w-full px-6 py-2 text-white bg-transparent border border-font-900 rounded-lg cursor-pointer  peer-checked:border-font-900 peer-checked:text-font-900 hover:text-gray-600  ">
                            Minted
                        </label>
                    </li>
                    <li>
                        <input type="radio" onChange={(e) => { setFilter(e.target.value) }} id="all" name="filter" value="all" class="hidden peer" />
                        <label for="all" class="text-sm inline-flex items-center justify-center w-full px-6 py-2 text-white bg-transparent border border-font-900 rounded-lg cursor-pointer  peer-checked:border-font-900 peer-checked:text-font-900 hover:text-gray-600  ">
                            All
                        </label>
                    </li>
                </ul>
                <div className='space-x-1 text-center mt-2 md:mt-0'>
                    <button className='border border-font-900 px-2' onClick={() => { setOpenGuide(true) }}>Guides</button>
                    <a className='border border-font-900 px-2' href='https://discord.gg/AS4zcDUSmK' target="_blank">Discord</a>
                    <a className='border border-font-900 px-2' href='https://twitter.com/potatozonbtc' target="_blank">Twitter</a>
                </div>
            </div>
            <div className='grid grid-cols-10'>
                {recordData.map(function (item, i) {
                    return (
                        <div className='relative wrapper-tag'>
                            <Image src={`/assets/images/${item.tag}.png`} alt="" className={`img-tag rounded-lg w-full ${item.status === 'available' ? 'saturate-[.10]' : ''}`} width={100} height={100} />
                            <div className='cursor-pointer content-tag'>
                                <div className='absolute bottom-0 left-0 w-full bg-black text-center opacity-50'>
                                    {item.status === 'available' ?
                                        <button onClick={() => {
                                            handleClickOpen();
                                            setSelectedTag(item.tag);
                                            setSelectedId(item.id);
                                        }}>
                                            <span>Mint</span>
                                        </button>
                                        : item.status === 'minted' ?
                                            <a href={item.ord} target="_blank">
                                                <span>ORD</span>
                                            </a>
                                            :
                                            <div>
                                                <span>Pending</span>
                                            </div>
                                    }
                                </div>
                                <div className='absolute top-0 left-0 w-full bg-black text-center opacity-50'>
                                    <div>
                                        <span>#{item.tag}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <Dialog
                fullWidth={true}
                maxWidth='sm'
                open={open}
                onClose={() => {
                    handleClose();
                    setLoad('default');
                }}
            >
                <DialogContent className='bg-font-900'>
                    <div className='text-center'>
                        <h1 className='text-3xl'>Mint Live Soon</h1>
                    </div>
                </DialogContent >
            </Dialog >
            <Dialog
                fullWidth={true}
                maxWidth='sm'
                open={openGuide}
                onClose={() => {
                    setOpenGuide(false);
                }}
            >
                <DialogContent className='bg-font-900'>
                    <div className='text-center'>

                        <ol class="relative border-l border-white px-10">
                            <li class="mb-10 ml-4">
                                <div class="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white"></div>
                                <h3 class="text-lg font-semibold text-gray-900 text-white">Step 1</h3>
                                <p class="mb-4 text-base font-normal text-white">Choose your Potatoz to mint, make sure Potatoz status is Available to mint.</p>
                                <img className='mx-auto' src='/assets/step/step1.jpg' style={{ width: '30vh' }} />
                            </li>
                            <li class="mb-10 ml-4">
                                <div class="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white"></div>
                                <h3 class="text-lg font-semibold text-gray-900 text-white">Step 2</h3>
                                <p class="mb-4 text-base font-normal text-white">Fill your input address with your BTC Wallet Address, make payment by click "Pay" button, you will directly redirect to Payment link. (Complete the payment before the time runs out, the time limit is 10 minutes.)</p>
                                <img className='mx-auto' src='/assets/step/step2.jpg' style={{ width: '30vh' }} />
                                <img className='mx-auto' src='/assets/step/step3.jpg' style={{ width: '30vh' }} />
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
                                <img className='mx-auto' src='/assets/step/step5.jpg' style={{ width: '30vh' }} />
                            </li>
                        </ol>

                    </div>
                </DialogContent >
            </Dialog >
        </div>
    );
}

export default Collection;
