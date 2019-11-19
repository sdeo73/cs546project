const packing = require('./data/packing.js');


async function main(){
    try {
        const added = await packing.createPackingList("hiking", ["Backpack", "Hiking boots", "First aid kit", "GPS or compass", "Tent", "Sunscreen", "Extra clothing", "Flashlight and batteries", "Insect repellant", "Toilet paper", "Snacks","Water Bottle", "Pocket Knife", "Sanitizer","Power Bank"]);
        console.log(added);
    } catch (error) {
        console.log(error);
    }  
}

main();


