import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    appName: 'Centring Tracker', login: 'Login', username: 'Username', password: 'Password',
    dashboard: 'Dashboard', equipment: 'Equipment', customers: 'Customers',
    rentals: 'Rentals', payments: 'Payments', maintenance: 'Maintenance',
    reports: 'Reports', users: 'Users', logout: 'Logout',
    addEquip: 'Add Equipment', addCust: 'Add Customer', newRental: 'New Rental',
    recPayment: 'Record Payment', logRepair: 'Log Repair', addUser: 'Add User',
    save: 'Save', cancel: 'Cancel', edit: 'Edit', delete: 'Delete', close: 'Close',
    name: 'Name', phone: 'Phone', village: 'Village / Town',
    machineName: 'Machine Name', qty: 'Quantity', costPerUnit: 'Cost per unit (₹)',
    condition: 'Condition', good: 'Good', repair: 'Needs Repair', damaged: 'Damaged',
    location: 'Location / Site',
    equipRented: 'Equipment rented', site: 'Site / Project',
    dateOut: 'Date sent out', returnDate: 'Expected return', actualReturn: 'Actual return date',
    dailyRate: 'Daily rate (₹)', deposit: 'Deposit (₹)', markReturned: 'Mark Returned',
    totalBill: 'Total bill (₹)', amtPaid: 'Amount paid (₹)', payDate: 'Payment date',
    notes: 'Notes', repairDesc: 'What was repaired', repairCost: 'Repair cost (₹)',
    nextService: 'Next service date', customer: 'Customer',
    status: 'Status', balance: 'Balance', paid: 'Paid', partial: 'Partial', pending: 'Pending',
    out: 'Out', overdue: 'Overdue', dueSoon: 'Due Soon', returned: 'Returned',
    role: 'Role', owner: 'Owner', member: 'Member',
    totalEquip: 'Equipment Types', activeRentals: 'Active Rentals',
    thisMonth: 'This Month Income', pendingDues: 'Pending Dues',
    totalCollected: 'Total Collected', repairCosts: 'Repair Costs',
    overdueRentals: 'Overdue Rentals', monthlyIncome: 'Monthly Income (6 months)',
    noData: 'No records yet', tapAdd: 'Use the + button to add',
    liveUpdate: 'Live — updated by', justNow: 'just now',
    searchPlaceholder: 'Search...', perDay: '/day', units: 'units',
    confirmDelete: 'Are you sure you want to delete this?',
    onlineUsers: 'online', syncedJustNow: 'Synced just now',
    newPwd: 'Password', ownerAccess: 'Owner access only',
    sales: 'Sales', newSale: 'New Sale', itemName: 'Item Name', ratePerUnit: 'Rate per unit (₹)',
    totalAmount: 'Total Amount', saleDate: 'Sale Date', totalSales: 'Total Sales',
    collected: 'Collected', stillPending: 'Still Pending', noSales: 'No sales yet',
    tapAddSale: 'Tap + Sale to record a sale', clear: 'Clear',
    home: 'Home', more: 'More', dailyUse: 'Daily Use', setupAdmin: 'Setup & Admin',
    quickActions: 'Quick Actions', overview: 'Overview', recentRentals: 'Recent Rentals',
    viewAll: 'View all', overdueAlert: 'Overdue Rentals!', tapToCollect: 'Tap to view and collect',
    goodMorning: 'Good Morning', goodAfternoon: 'Good Afternoon', goodEvening: 'Good Evening',
    searchCustomer: 'Search customer by name or village...', noCustomerFound: 'No customer found',
    speakTelugu: 'Speaking in Telugu...', switchToTelugu: 'Switch to తెలుగు', switchToEnglish: 'Switch to English',
    returnSettle: 'Return & Settle', confirmSave: 'Confirm & Save', amountCollected: 'Amount collected now (₹)',
    advancePaid: 'Advance paid (₹)', remaining: 'Remaining to collect', fullySettled: 'Fully settled',
    stillPendingShort: 'Still pending', daysOut: 'Days out', rate: 'Rate', estBill: 'Est. Bill',
    totalPerDay: 'Total per day', addEquipment: 'Add another equipment', equipAndRates: 'Equipment & Rates',
    siteLocation: 'Site / Project location', dateSentOut: 'Date sent out', expectedReturn: 'Expected return',
    paymentHistory: 'Payment History'
  },
  te: {
    appName: 'సెంట్రింగ్ ట్రాకర్', login: 'లాగిన్', username: 'యూజర్నేమ్', password: 'పాస్వర్డ్',
    dashboard: 'డాష్‌బోర్డ్', equipment: 'పరికరాలు', customers: 'కస్టమర్లు',
    rentals: 'అద్దెలు', payments: 'చెల్లింపులు', maintenance: 'నిర్వహణ',
    reports: 'నివేదికలు', users: 'వినియోగదారులు', logout: 'లాగ్అవుట్',
    addEquip: 'పరికరం చేర్చు', addCust: 'కస్టమర్ చేర్చు', newRental: 'కొత్త అద్దె',
    recPayment: 'చెల్లింపు నమోదు', logRepair: 'మరమ్మత్తు నమోదు', addUser: 'వినియోగదారు చేర్చు',
    save: 'సేవ్ చేయి', cancel: 'రద్దు', edit: 'మార్చు', delete: 'తొలగించు', close: 'మూసివేయి',
    name: 'పేరు', phone: 'ఫోన్', village: 'గ్రామం / పట్టణం',
    machineName: 'మెషీన్ పేరు', qty: 'పరిమాణం', costPerUnit: 'యూనిట్ కు ధర (₹)',
    condition: 'స్థితి', good: 'బాగుంది', repair: 'మరమ్మత్తు కావాలి', damaged: 'దెబ్బతింది',
    location: 'స్థానం / సైట్',
    equipRented: 'అద్దెకు ఇచ్చిన పరికరం', site: 'సైట్ / ప్రాజెక్ట్',
    dateOut: 'పంపిన తేదీ', returnDate: 'తిరిగి వచ్చే తేదీ', actualReturn: 'నిజంగా వచ్చిన తేదీ',
    dailyRate: 'రోజువారీ రేటు (₹)', deposit: 'డిపాజిట్ (₹)', markReturned: 'తిరిగివచ్చినట్టు గుర్తించు',
    totalBill: 'మొత్తం బిల్లు (₹)', amtPaid: 'చెల్లించిన మొత్తం (₹)', payDate: 'చెల్లింపు తేదీ',
    notes: 'గమనికలు', repairDesc: 'ఏమి మరమ్మత్తు చేశారు', repairCost: 'మరమ్మత్తు ఖర్చు (₹)',
    nextService: 'తదుపరి సర్వీస్ తేదీ', customer: 'కస్టమర్',
    status: 'స్థితి', balance: 'బాకీ', paid: 'చెల్లించారు', partial: 'పాక్షిక', pending: 'పెండింగ్',
    out: 'వెళ్ళింది', overdue: 'గడువు మించింది', dueSoon: 'త్వరలో గడువు', returned: 'తిరిగివచ్చింది',
    role: 'పాత్ర', owner: 'యజమాని', member: 'సభ్యుడు',
    totalEquip: 'పరికర రకాలు', activeRentals: 'చురుకైన అద్దెలు',
    thisMonth: 'ఈ నెల ఆదాయం', pendingDues: 'పెండింగ్ బాకీలు',
    totalCollected: 'మొత్తం వసూలు', repairCosts: 'మరమ్మత్తు ఖర్చులు',
    overdueRentals: 'గడువు మించిన అద్దెలు', monthlyIncome: 'నెలవారీ ఆదాయం (6 నెలలు)',
    noData: 'ఇంకా రికార్డులు లేవు', tapAdd: '+ బటన్ నొక్కి చేర్చండి',
    liveUpdate: 'నేరుగా నవీకరించారు', justNow: 'ఇప్పుడే',
    searchPlaceholder: 'వెతకండి...', perDay: '/రోజు', units: 'యూనిట్లు',
    confirmDelete: 'ఖచ్చితంగా తొలగించాలా?',
    onlineUsers: 'ఆన్లైన్', syncedJustNow: 'ఇప్పుడే సమకాలీకరించబడింది',
    newPwd: 'పాస్వర్డ్', ownerAccess: 'యజమాని మాత్రమే',
    sales: 'అమ్మకాలు', newSale: 'కొత్త అమ్మకం', itemName: 'వస్తువు పేరు', ratePerUnit: 'యూనిట్ ధర (₹)',
    totalAmount: 'మొత్తం', saleDate: 'అమ్మిన తేదీ', totalSales: 'మొత్తం అమ్మకాలు',
    collected: 'వసూలు చేసారు', stillPending: 'ఇంకా పెండింగ్', noSales: 'ఇంకా అమ్మకాలు లేవు',
    tapAddSale: '+ అమ్మకం నొక్కి చేర్చండి', clear: 'క్లియర్',
    home: 'హోమ్', more: 'మరిన్ని', dailyUse: 'రోజువారీ వాడకం', setupAdmin: 'సెటప్ & అడ్మిన్',
    quickActions: 'త్వరిత చర్యలు', overview: 'అవలోకనం', recentRentals: 'ఇటీవలి అద్దెలు',
    viewAll: 'అన్నీ చూడండి', overdueAlert: 'గడువు మించిన అద్దెలు!', tapToCollect: 'చూసి వసూలు చేయడానికి నొక్కండి',
    goodMorning: 'శుభోదయం', goodAfternoon: 'శుభ మధ్యాహ్నం', goodEvening: 'శుభ సాయంత్రం',
    searchCustomer: 'పేరు లేదా గ్రామం ద్వారా కస్టమర్‌ను వెతకండి...', noCustomerFound: 'కస్టమర్ కనుగొనబడలేదు',
    speakTelugu: 'తెలుగులో మాట్లాడుతున్నారు...', switchToTelugu: 'తెలుగుకు మార్చండి', switchToEnglish: 'ఇంగ్లీష్‌కు మార్చండి',
    returnSettle: 'తిరిగివచ్చి సెటిల్ చేయండి', confirmSave: 'నిర్ధారించి సేవ్ చేయండి', amountCollected: 'ఇప్పుడు వసూలు చేసిన మొత్తం (₹)',
    advancePaid: 'అడ్వాన్స్ చెల్లించారు (₹)', remaining: 'వసూలు చేయవలసినది', fullySettled: 'పూర్తిగా సెటిల్ అయింది',
    stillPendingShort: 'ఇంకా పెండింగ్', daysOut: 'వెళ్ళిన రోజులు', rate: 'రేటు', estBill: 'అంచనా బిల్లు',
    totalPerDay: 'రోజుకు మొత్తం', addEquipment: 'మరో పరికరం చేర్చండి', equipAndRates: 'పరికరాలు & రేట్లు',
    siteLocation: 'సైట్ / ప్రాజెక్ట్ స్థానం', dateSentOut: 'పంపిన తేదీ', expectedReturn: 'తిరిగి వచ్చే తేదీ',
    paymentHistory: 'చెల్లింపుల చరిత్ర'
  }
};

const LangContext = createContext(null);
export const useLang = () => useContext(LangContext);

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');
  const toggle = () => {
    const next = lang === 'en' ? 'te' : 'en';
    setLang(next);
    localStorage.setItem('lang', next);
  };
  const t = key => translations[lang][key] || key;
  return (
    <LangContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LangContext.Provider>
  );
};