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
    newPwd: 'Password', ownerAccess: 'Owner access only'
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
    newPwd: 'పాస్వర్డ్', ownerAccess: 'యజమాని మాత్రమే'
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
