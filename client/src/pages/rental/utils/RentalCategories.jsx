/**
 * Source data for RentalCategory seeding. Plain array of
 * { name, subCategories: [name, ...] } — pair with seedRentalCategories.js
 * to insert these into MongoDB with slugs auto-generated.
 */
export const rentalCategories = [
  {
    name: 'Vehicles & Transportation',
    subCategories: [
      'Cars', 'SUVs', 'Buses', 'Minibuses', 'Trucks', 'Pick-up Trucks', 'Vans',
      'Motorcycles', 'Tricycles / Keke', 'Bicycles', 'Scooters', 'Trailers',
      'Car Carriers', 'Boats', 'Watercraft', 'Vehicle Accessories',
      'Car Rental with Driver', 'Chauffeur Services',
    ],
  },
  {
    name: 'Mechanics & Auto Equipment',
    subCategories: [
      'Diagnostic Scanners', 'Car Jacks', 'Hydraulic Jacks', 'Engine Hoists',
      'Engine Stands', 'Wheel Balancers', 'Tyre Changers', 'Air Compressors',
      'Battery Chargers', 'Jump Starters', 'Welding Machines', 'Car Lifts',
      'Mechanics Tool Sets', 'Impact Wrenches', 'Pressure Washers',
      'Workshop Equipment', 'Auto Repair Equipment',
    ],
  },
  {
    name: 'Generators & Power Equipment',
    subCategories: [
      'Petrol Generators', 'Diesel Generators', 'Industrial Generators',
      'Silent Generators', 'Inverter Generators', 'Solar Generators',
      'Solar Panels', 'Inverters', 'Batteries', 'Power Stations',
      'Transformers', 'Distribution Boards', 'Cables & Extension Reels',
      'Lighting Towers', 'Generator Accessories',
    ],
  },
  {
    name: 'Construction & Building Equipment',
    subCategories: [
      'Concrete Mixers', 'Vibrators', 'Compactors', 'Excavators', 'Bulldozers',
      'Loaders', 'Cranes', 'Scaffolding', 'Ladders', 'Wheelbarrows',
      'Drilling Machines', 'Cutting Machines', 'Grinding Machines',
      'Jackhammers', 'Plate Compactors', 'Concrete Pumps', 'Construction Tools',
      'Surveying Equipment', 'Safety Equipment',
    ],
  },
  {
    name: 'Agricultural Equipment',
    subCategories: [
      'Tractors', 'Power Tillers', 'Ploughs', 'Harrows', 'Planters', 'Seeders',
      'Harvesters', 'Threshers', 'Irrigation Equipment', 'Water Pumps',
      'Sprayers', 'Brush Cutters', 'Grass Cutters', 'Milling Machines',
      'Feed Mixers', 'Chaff Cutters', 'Animal Handling Equipment',
      'Greenhouse Equipment', 'Farm Tools', 'Agricultural Trailers',
    ],
  },
  {
    name: 'Clothing & Fashion',
    subCategories: [
      'Native Wear', 'Agbada', 'Aso Ebi', 'Dresses', 'Suits', 'Tuxedos',
      'Shirts', 'Trousers', 'Skirts', 'Traditional Outfits', 'Wedding Dresses',
      'Bridal Gowns', 'Bridesmaid Dresses', "Children's Clothing", 'Costumes',
      'Stage Costumes', 'Corporate Wear', 'Fashion Accessories', 'Handbags',
      'Shoes', 'Jewelry', 'Watches',
    ],
  },
  {
    name: 'Events & Party Equipment',
    subCategories: [
      'Canopies', 'Tents', 'Chairs', 'Tables', 'Dance Floors',
      'Stage Platforms', 'Event Backdrops', 'Decorations', 'Balloon Equipment',
      'Red Carpets', 'Crowd Barriers', 'Event Fencing', 'Umbrellas',
      'Cooling Fans', 'Air Coolers', 'Heaters', 'Event Lighting', 'LED Screens',
      'Projectors', 'Generators', 'Event Furniture',
    ],
  },
  {
    name: 'Kitchen & Catering Equipment',
    subCategories: [
      'Cooking Pots', 'Large Cooking Pots', 'Gas Burners', 'Gas Cylinders',
      'Ovens', 'Microwaves', 'Fryers', 'Grills', 'Barbecue Equipment',
      'Food Warmers', 'Chafing Dishes', 'Food Trays', 'Serving Equipment',
      'Blenders', 'Mixers', 'Refrigerators', 'Freezers', 'Ice Makers',
      'Coffee Machines', 'Popcorn Machines', 'Shawarma Machines',
      'Catering Equipment', 'Kitchen Utensils', 'Cutlery', 'Plates & Glassware',
    ],
  },
  {
    name: 'Photography & Videography',
    subCategories: [
      'Cameras', 'DSLR Cameras', 'Mirrorless Cameras', 'Video Cameras',
      'Lenses', 'Tripods', 'Gimbals', 'Drones', 'Camera Lights', 'Flash Units',
      'Softboxes', 'Reflectors', 'Green Screens', 'Microphones',
      'Audio Recorders', 'Camera Monitors', 'Memory Cards',
      'Photography Accessories', 'Photo Booths',
    ],
  },
  {
    name: 'Music & Entertainment',
    subCategories: [
      'Speakers', 'PA Systems', 'Subwoofers', 'Amplifiers', 'Mixers',
      'Microphones', 'DJ Controllers', 'DJ Equipment', 'Turntables',
      'Musical Instruments', 'Keyboards', 'Pianos', 'Drums', 'Guitars',
      'Karaoke Machines', 'Smoke Machines', 'Bubble Machines', 'Disco Lights',
      'Stage Lighting', 'Entertainment Equipment',
    ],
  },
  {
    name: 'Home & Household',
    subCategories: [
      'Furniture', 'Sofas', 'Chairs', 'Dining Sets', 'Beds', 'Mattresses',
      'Wardrobes', 'Tables', 'Home Appliances', 'Refrigerators', 'Freezers',
      'Washing Machines', 'Air Conditioners', 'Fans', 'Televisions',
      'Vacuum Cleaners', 'Carpet Cleaners', 'Cleaning Equipment', 'Home Decor',
      'Kitchen Appliances',
    ],
  },
  {
    name: 'Office & Business Equipment',
    subCategories: [
      'Laptops', 'Desktop Computers', 'Monitors', 'Printers', 'Photocopiers',
      'Scanners', 'Projectors', 'Projector Screens', 'Conference Equipment',
      'Office Furniture', 'Office Chairs', 'Desks', 'Meeting Tables',
      'PA Systems', 'Wi-Fi Routers', 'POS Machines', 'Barcode Scanners',
      'Shredders',
    ],
  },
  {
    name: 'Technology & Electronics',
    subCategories: [
      'Laptops', 'Tablets', 'Smartphones', 'Cameras', 'Projectors',
      'Gaming Consoles', 'Game Accessories', 'VR Headsets', 'Smart TVs',
      'Speakers', 'Headphones', 'Microphones', 'Power Banks', 'Wi-Fi Devices',
      'Networking Equipment', 'Streaming Equipment', 'Electronic Accessories',
    ],
  },
  {
    name: 'Tools & Machinery',
    subCategories: [
      'Power Tools', 'Hand Tools', 'Drills', 'Grinders', 'Saws', 'Sanders',
      'Welding Machines', 'Compressors', 'Generators', 'Pressure Washers',
      'Cutting Machines', 'Industrial Machinery', 'Woodworking Equipment',
      'Metalworking Equipment', 'Plumbing Tools', 'Electrical Tools',
    ],
  },
  {
    name: 'Outdoor & Camping',
    subCategories: [
      'Tents', 'Camping Chairs', 'Camping Tables', 'Sleeping Bags',
      'Mattresses', 'Camping Stoves', 'Coolers', 'Portable Fridges',
      'Portable Toilets', 'Outdoor Lighting', 'Hiking Equipment', 'Backpacks',
      'Gazebos', 'Outdoor Heaters', 'Outdoor Furniture',
    ],
  },
  {
    name: 'Sports & Recreation',
    subCategories: [
      'Football Equipment', 'Basketball Equipment', 'Tennis Equipment',
      'Table Tennis Equipment', 'Gym Equipment', 'Treadmills',
      'Exercise Bikes', 'Weight Sets', 'Boxing Equipment', 'Swimming Equipment',
      'Bicycles', 'Golf Equipment', 'Sports Kits', 'Fitness Equipment',
      'Recreational Equipment',
    ],
  },
  {
    name: 'Medical & Healthcare Equipment',
    subCategories: [
      'Hospital Beds', 'Wheelchairs', 'Walking Frames', 'Crutches',
      'Patient Monitors', 'Oxygen Concentrators', 'Nebulizers',
      'Blood Pressure Monitors', 'Medical Couches', 'Mobility Equipment',
      'Physiotherapy Equipment', 'Home Care Equipment',
      'Medical Examination Equipment',
    ],
  },
  {
    name: 'Wedding & Bridal',
    subCategories: [
      'Wedding Dresses', 'Bridal Gowns', 'Bridesmaid Dresses', "Groom's Suits",
      'Traditional Wedding Outfits', 'Wedding Chairs', 'Wedding Tables',
      'Wedding Canopies', 'Wedding Decorations', 'Aisle Decor', 'Backdrops',
      'Wedding Lighting', 'Photo Booths', 'Wedding Props', 'Wedding Accessories',
    ],
  },
  {
    name: 'Retail & Commercial Equipment',
    subCategories: [
      'Display Shelves', 'Display Stands', 'Mannequins', 'Clothing Racks',
      'Market Stalls', 'Pop-up Shops', 'Refrigerated Display Cases', 'Freezers',
      'Food Displays', 'Cash Registers', 'POS Equipment', 'Shopping Baskets',
      'Trolleys', 'Signage', 'Promotional Stands',
    ],
  },
  {
    name: 'Industrial Equipment',
    subCategories: [
      'Forklifts', 'Cranes', 'Compressors', 'Generators', 'Welding Equipment',
      'Pumps', 'Industrial Motors', 'Drilling Equipment', 'Lifting Equipment',
      'Material Handling Equipment', 'Factory Machinery',
      'Processing Equipment', 'Storage Equipment',
    ],
  },
  {
    name: 'Water & Cleaning Equipment',
    subCategories: [
      'Water Pumps', 'Borehole Equipment', 'Pressure Washers', 'Water Tanks',
      'Water Treatment Equipment', 'Industrial Cleaners', 'Carpet Cleaners',
      'Floor Scrubbers', 'Vacuum Cleaners', 'Steam Cleaners',
      'Drain Cleaning Equipment', 'Cleaning Machines',
    ],
  },
  {
    name: 'Film, Media & Production',
    subCategories: [
      'Cinema Cameras', 'Video Cameras', 'Lenses', 'Tripods', 'Gimbals',
      'Studio Lights', 'LED Panels', 'Teleprompters', 'Green Screens',
      'Audio Recorders', 'Boom Microphones', 'Wireless Microphones',
      'Production Monitors', 'Film Equipment', 'Studio Equipment',
    ],
  },
  {
    name: 'Property & Accommodation',
    subCategories: [
      'Apartments', 'Houses', 'Shortlets', 'Serviced Apartments',
      'Holiday Homes', 'Vacation Homes', 'Event Spaces', 'Meeting Rooms',
      'Conference Rooms', 'Office Spaces', 'Studios', 'Warehouses', 'Shops',
      'Party Venues',
    ],
  },
  {
    name: 'Travel & Lifestyle',
    subCategories: [
      'Travel Bags', 'Suitcases', 'Baby Travel Equipment', 'Car Seats',
      'Baby Strollers', 'Travel Cots', 'Camping Equipment', 'Beach Equipment',
      'Portable Chargers', 'Travel Accessories',
    ],
  },
  {
    name: 'Baby & Kids',
    subCategories: [
      'Baby Cots', 'Baby Strollers', 'Car Seats', 'High Chairs',
      'Baby Walkers', 'Toys', 'Bouncy Castles', "Kids' Tables & Chairs",
      "Children's Costumes", 'Baby Monitors', 'Breast Pumps', 'Baby Equipment',
    ],
  },
  {
    name: 'Games & Entertainment',
    subCategories: [
      'PlayStation', 'Xbox', 'Nintendo Switch', 'Gaming PCs', 'VR Headsets',
      'Arcade Machines', 'Board Games', 'Card Games', 'Pool Tables',
      'Foosball Tables', 'Table Tennis Tables', 'Bouncy Castles',
      'Outdoor Games',
    ],
  },
  {
    name: 'Energy & Solar',
    subCategories: [
      'Solar Panels', 'Solar Inverters', 'Solar Batteries', 'Inverter Systems',
      'Portable Power Stations', 'Solar Generators', 'Solar Lights',
      'Energy Storage Systems', 'Charge Controllers', 'Solar Accessories',
    ],
  },
  {
    name: 'Furniture & Decor',
    subCategories: [
      'Sofas', 'Armchairs', 'Dining Tables', 'Dining Chairs', 'Coffee Tables',
      'Beds', 'Mattresses', 'Office Chairs', 'Office Desks',
      'Outdoor Furniture', 'Event Furniture', 'Decorative Furniture',
      'Mirrors', 'Rugs', 'Curtains', 'Lamps',
    ],
  },
  {
    name: 'Home Improvement',
    subCategories: [
      'Ladders', 'Drills', 'Saws', 'Sanders', 'Paint Sprayers',
      'Pressure Washers', 'Tile Cutters', 'Wallpaper Equipment',
      'Plumbing Tools', 'Electrical Tools', 'Gardening Tools',
      'Painting Equipment',
    ],
  },
  {
    name: 'Gardening & Landscaping',
    subCategories: [
      'Lawn Mowers', 'Grass Cutters', 'Hedge Trimmers', 'Chainsaws',
      'Leaf Blowers', 'Garden Tillers', 'Water Pumps', 'Sprinklers',
      'Pressure Sprayers', 'Garden Tools', 'Landscaping Equipment',
      'Wheelbarrows', 'Garden Furniture',
    ],
  },
];

export default rentalCategories;