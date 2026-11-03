export const AUDIENCE_RECORDS = [
  { id:'PRV-0001', origin:'Jamaica', region:'St Andrew', city:'London', country:'United Kingdom', stage:'Waitlist', source:'Instagram', mark:'KGN-LON-7Q4X', joined:'14 Oct', consent:true },
  { id:'PRV-0002', origin:'Guyana', region:'Demerara-Mahaica', city:'New York', country:'United States', stage:'Waitlist', source:'TikTok', mark:'GEO-NYC-2LM8', joined:'14 Oct', consent:true },
  { id:'PRV-0003', origin:'Pakistan', region:'Punjab', city:'Birmingham', country:'United Kingdom', stage:'Left after mark', source:'Direct', mark:'LHE-BHX-9KD1', joined:'14 Oct', consent:false },
  { id:'PRV-0004', origin:'Ghana', region:'Greater Accra', city:'Toronto', country:'Canada', stage:'Waitlist', source:'Referral', mark:'ACC-YYZ-4TR6', joined:'13 Oct', consent:true },
  { id:'PRV-0005', origin:'Barbados', region:'St Michael', city:'London', country:'United Kingdom', stage:'Left after destination', source:'Instagram', mark:'—', joined:'13 Oct', consent:false },
  { id:'PRV-0006', origin:'Nigeria', region:'Lagos State', city:'London', country:'United Kingdom', stage:'Waitlist', source:'Newsletter', mark:'LOS-LON-6PE3', joined:'13 Oct', consent:true },
  { id:'PRV-0007', origin:'Jamaica', region:'Kingston Parish', city:'London', country:'United Kingdom', stage:'Left after mark', source:'TikTok', mark:'KGN-LON-3HZ9', joined:'13 Oct', consent:false },
  { id:'PRV-0008', origin:'Jamaica', region:'St Catherine', city:'Toronto', country:'Canada', stage:'Waitlist', source:'Instagram', mark:'KGN-YYZ-8WC2', joined:'13 Oct', consent:true },
  { id:'PRV-0009', origin:'Trinidad and Tobago', region:'Port of Spain', city:'New York', country:'United States', stage:'Waitlist', source:'Direct', mark:'POS-NYC-5VA7', joined:'12 Oct', consent:true },
  { id:'PRV-0010', origin:'Bangladesh', region:'Dhaka Division', city:'London', country:'United Kingdom', stage:'Left after destination', source:'Referral', mark:'—', joined:'12 Oct', consent:false },
]

export const CORRIDOR_RECORDS = [
  { id:'kingston-london', origin:'Jamaica', from:'Kingston', to:'London', country:'United Kingdom', fromCode:'KGN', toCode:'LON', audience:580, growth:22.9, share:18.4, point:[225,267], target:[442,144], bend:[338,115], source:'Instagram' },
  { id:'georgetown-newyork', origin:'Guyana', from:'Georgetown', to:'New York', country:'United States', fromCode:'GEO', toCode:'NYC', audience:416, growth:27.2, share:13.2, point:[270,290], target:[217,183], bend:[216,210], source:'TikTok' },
  { id:'lahore-birmingham', origin:'Pakistan', from:'Lahore', to:'Birmingham', country:'United Kingdom', fromCode:'LHE', toCode:'BHX', audience:385, growth:25, share:12.2, point:[658,224], target:[442,137], bend:[555,91], source:'Direct' },
  { id:'accra-toronto', origin:'Ghana', from:'Accra', to:'Toronto', country:'Canada', fromCode:'ACC', toCode:'YYZ', audience:315, growth:31.7, share:10, point:[446,305], target:[230,196], bend:[345,62], source:'Referral' },
  { id:'bridgetown-london', origin:'Barbados', from:'Bridgetown', to:'London', country:'United Kingdom', fromCode:'BGI', toCode:'LON', audience:254, growth:18.6, share:8.1, point:[274,282], target:[442,144], bend:[343,131], source:'Instagram' },
  { id:'accra-london', origin:'Ghana', from:'Accra', to:'London', country:'United Kingdom', fromCode:'ACC', toCode:'LON', audience:208, growth:35.1, share:6.6, point:[446,305], target:[442,144], bend:[429,203], source:'Referral' },
  { id:'lagos-london', origin:'Nigeria', from:'Lagos', to:'London', country:'United Kingdom', fromCode:'LOS', toCode:'LON', audience:196, growth:21.4, share:6.2, point:[456,305], target:[442,144], bend:[471,205], source:'Newsletter' },
  { id:'kingston-toronto', origin:'Jamaica', from:'Kingston', to:'Toronto', country:'Canada', fromCode:'KGN', toCode:'YYZ', audience:174, growth:19.3, share:5.5, point:[225,267], target:[230,196], bend:[221,220], source:'Instagram' },
  { id:'portofspain-newyork', origin:'Trinidad and Tobago', from:'Port of Spain', to:'New York', country:'United States', fromCode:'POS', toCode:'NYC', audience:165, growth:17.1, share:5.2, point:[279,305], target:[217,183], bend:[231,202], source:'Direct' },
  { id:'dhaka-london', origin:'Bangladesh', from:'Dhaka', to:'London', country:'United Kingdom', fromCode:'DAC', toCode:'LON', audience:152, growth:20.5, share:4.8, point:[701,255], target:[442,144], bend:[580,88], source:'Referral' },
  { id:'kingston-newyork', origin:'Jamaica', from:'Kingston', to:'New York', country:'United States', fromCode:'KGN', toCode:'NYC', audience:146, growth:15.6, share:4.6, point:[225,267], target:[217,183], bend:[195,211], source:'TikTok' },
  { id:'georgetown-london', origin:'Guyana', from:'Georgetown', to:'London', country:'United Kingdom', fromCode:'GEO', toCode:'LON', audience:136, growth:16.8, share:4.3, point:[270,290], target:[442,144], bend:[323,120], source:'Direct' },
]

export function filterAudience(records, filters = {}) {
  const search = (filters.search || '').trim().toLowerCase()
  return records.filter(row => (!search || search.split(/\s+/).every(term => Object.values(row).join(' ').toLowerCase().includes(term))) && (!filters.origin || row.origin === filters.origin) && (!filters.city || row.city === filters.city) && (!filters.source || row.source === filters.source) && (!filters.corridor || `${row.origin} → ${row.city}` === filters.corridor))
}
export function filterCorridors(records, filters = {}) {
  const search = (filters.search || '').trim().toLowerCase()
  return records.filter(row => (!search || search.split(/\s+/).every(term => `${row.from} ${row.to} ${row.origin} ${row.country}`.toLowerCase().includes(term))) && (!filters.origin || row.origin === filters.origin) && (!filters.city || row.to === filters.city) && (!filters.source || row.source === filters.source))
}
export const routeLabel = row => `${row.from} → ${row.to}`
