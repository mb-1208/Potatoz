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
                        amount: 60000000,
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
            <div className='text-center mb-4'>
                <span>Remaining:</span>
                <p>{remaining}/100</p>
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
                                            <div>
                                                <span>ORD</span>
                                            </div>
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
                        {/* <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Address</label>
                        <input onChange={(e) => { setAddress(e.target.value) }} type="text" placeholder='bc1...' class="focus:outline-none block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:ring-blue-500 focus:border-blue-500" />
                        {load === 'default' &&
                            <button onClick={() => { handleMint(selectedTag, selectedId) }} className='text-white mt-4 border-2 border-white px-4 py-1 rounded-lg hover:bg-white hover:text-font-900 transition-all duration-200'>Pay</button>
                        }
                        {load === 'checking' &&
                            <span className='text-xs text-white pt-2'>Checking availability...</span>
                        }
                        {load === 'ready' &&
                            <span className='text-xs text-white pt-2'>Ready to mint...</span>
                        }
                        {load === 'pending' &&
                            <span className='text-xs text-white pt-2'>Sorry. This Potatoz is no longer available. :(</span>
                        } */}
                    </div>
                </DialogContent >
            </Dialog >
        </div>
    );
}

export default Collection;