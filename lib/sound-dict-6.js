const baseURL = process.env.BASE_URL;

module.exports = [{
    notes: ['D33', 'G34', 'EF4', 'C25', '50', '55', '60', '65', '70'],
    conference: "okgo-conference-A",
    fallbackUrl: "https://handler.twilio.com/twiml/EH0ffa030809073f01418500dbbd4afefa",
    color : "blue",
    active: 'false',
    num: 0, //should be same as members.length
    members: [] //init
  }, {
    notes: ['A35', 'A3min', 'G4', 'D24', '51', '56', '61', '66'],
    conference: "okgo-conference-B",
    fallbackUrl: "https://handler.twilio.com/twiml/EHdb552a71eb5049fcc9427b9ffaf0fb45",
    color : "green",
    num: 0, //should be same as members.length
    members: [] //init
  }, {
    notes: ['G35', 'A4', 'C4', 'E24', '52', '57', '62', '67'],
    conference: "okgo-conference-C",
    fallbackUrl: "https://handler.twilio.com/twiml/EHe50dd2670479c5ea4554ac5ee330ee59",
    color : "red",
    num: 0, //should be same as members.length
    members: [] //init
  }, {
    notes: ['F33', 'DG3', 'D4', 'F24', '53', '58', '63', '68'],
    conference: "okgo-conference-D",
    fallbackUrl: "https://handler.twilio.com/twiml/EH1fe00e776e62cc23530def95d2366cab",
    color: "orange",
    num: 0, //should be same as members.length
    members: [] //init
  }, {
    notes: ['A34', 'GF4', 'E4', 'drone', '54', '59', '64', '69'],
    conference: "okgo-conference-E",
    fallbackUrl: "https://handler.twilio.com/twiml/EHb7a828f87d41661c2e40a49728105dfe",
    color: "yellow",
    num: 0, //should be same as members.length
    members: [] //init
  }, {
  notes: ['D33', 'G34', 'EF4', 'C25', '50', '55', '60', '65', '70'],
    conference: "okgo-conference-F",
    fallbackUrl: "https://handler.twilio.com/twiml/EHcfe5079484ab4257a31b24e86e0a1c41",
    color : "blue",
    active: 'false',
    num: 0, //should be same as members.length
    members: [] //init
  }
]