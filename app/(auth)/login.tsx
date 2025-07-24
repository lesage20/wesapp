import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';
import { useRouter } from 'expo-router';
import { requestOtp, storePhoneNumber } from '~/api/services/authService';

// Map des codes alpha-2 vers alpha-3
const alpha2ToAlpha3 = {
  AD: 'AND', // Andorra
  AE: 'ARE', // United Arab Emirates
  AF: 'AFG', // Afghanistan
  AG: 'ATG', // Antigua and Barbuda
  AI: 'AIA', // Anguilla
  AL: 'ALB', // Albania
  AM: 'ARM', // Armenia
  AO: 'AGO', // Angola
  AQ: 'ATA', // Antarctica
  AR: 'ARG', // Argentina
  AS: 'ASM', // American Samoa
  AT: 'AUT', // Austria
  AU: 'AUS', // Australia
  AW: 'ABW', // Aruba
  AX: 'ALA', // Åland Islands
  AZ: 'AZE', // Azerbaijan
  BA: 'BIH', // Bosnia and Herzegovina
  BB: 'BRB', // Barbados
  BD: 'BGD', // Bangladesh
  BE: 'BEL', // Belgium
  BF: 'BFA', // Burkina Faso
  BG: 'BGR', // Bulgaria
  BH: 'BHR', // Bahrain
  BI: 'BDI', // Burundi
  BJ: 'BEN', // Benin
  BL: 'BLM', // Saint Barthélemy
  BM: 'BMU', // Bermuda
  BN: 'BRN', // Brunei Darussalam
  BO: 'BOL', // Bolivia
  BQ: 'BES', // Bonaire, Sint Eustatius and Saba
  BR: 'BRA', // Brazil
  BS: 'BHS', // Bahamas
  BT: 'BTN', // Bhutan
  BV: 'BVT', // Bouvet Island
  BW: 'BWA', // Botswana
  BY: 'BLR', // Belarus
  BZ: 'BLZ', // Belize
  CA: 'CAN', // Canada
  CC: 'CCK', // Cocos (Keeling) Islands
  CD: 'COD', // Congo, Democratic Republic of the
  CF: 'CAF', // Central African Republic
  CG: 'COG', // Congo
  CH: 'CHE', // Switzerland
  CI: 'CIV', // Côte d'Ivoire
  CK: 'COK', // Cook Islands
  CL: 'CHL', // Chile
  CM: 'CMR', // Cameroon
  CN: 'CHN', // China
  CO: 'COL', // Colombia
  CR: 'CRI', // Costa Rica
  CU: 'CUB', // Cuba
  CV: 'CPV', // Cabo Verde
  CW: 'CUW', // Curaçao
  CX: 'CXR', // Christmas Island
  CY: 'CYP', // Cyprus
  CZ: 'CZE', // Czech Republic
  DE: 'DEU', // Germany
  DJ: 'DJI', // Djibouti
  DK: 'DNK', // Denmark
  DM: 'DMA', // Dominica
  DO: 'DOM', // Dominican Republic
  DZ: 'DZA', // Algeria
  EC: 'ECU', // Ecuador
  EE: 'EST', // Estonia
  EG: 'EGY', // Egypt
  EH: 'ESH', // Western Sahara
  ER: 'ERI', // Eritrea
  ES: 'ESP', // Spain
  ET: 'ETH', // Ethiopia
  FI: 'FIN', // Finland
  FJ: 'FJI', // Fiji
  FK: 'FLK', // Falkland Islands
  FM: 'FSM', // Micronesia
  FO: 'FRO', // Faroe Islands
  FR: 'FRA', // France
  GA: 'GAB', // Gabon
  GB: 'GBR', // United Kingdom
  GD: 'GRD', // Grenada
  GE: 'GEO', // Georgia
  GF: 'GUF', // French Guiana
  GG: 'GGY', // Guernsey
  GH: 'GHA', // Ghana
  GI: 'GIB', // Gibraltar
  GL: 'GRL', // Greenland
  GM: 'GMB', // Gambia
  GN: 'GIN', // Guinea
  GP: 'GLP', // Guadeloupe
  GQ: 'GNQ', // Equatorial Guinea
  GR: 'GRC', // Greece
  GS: 'SGS', // South Georgia and the South Sandwich Islands
  GT: 'GTM', // Guatemala
  GU: 'GUM', // Guam
  GW: 'GNB', // Guinea-Bissau
  GY: 'GUY', // Guyana
  HK: 'HKG', // Hong Kong
  HM: 'HMD', // Heard Island and McDonald Islands
  HN: 'HND', // Honduras
  HR: 'HRV', // Croatia
  HT: 'HTI', // Haiti
  HU: 'HUN', // Hungary
  ID: 'IDN', // Indonesia
  IE: 'IRL', // Ireland
  IL: 'ISR', // Israel
  IM: 'IMN', // Isle of Man
  IN: 'IND', // India
  IO: 'IOT', // British Indian Ocean Territory
  IQ: 'IRQ', // Iraq
  IR: 'IRN', // Iran
  IS: 'ISL', // Iceland
  IT: 'ITA', // Italy
  JE: 'JEY', // Jersey
  JM: 'JAM', // Jamaica
  JO: 'JOR', // Jordan
  JP: 'JPN', // Japan
  KE: 'KEN', // Kenya
  KG: 'KGZ', // Kyrgyzstan
  KH: 'KHM', // Cambodia
  KI: 'KIR', // Kiribati
  KM: 'COM', // Comoros
  KN: 'KNA', // Saint Kitts and Nevis
  KP: 'PRK', // North Korea
  KR: 'KOR', // South Korea
  KW: 'KWT', // Kuwait
  KY: 'CYM', // Cayman Islands
  KZ: 'KAZ', // Kazakhstan
  LA: 'LAO', // Laos
  LB: 'LBN', // Lebanon
  LC: 'LCA', // Saint Lucia
  LI: 'LIE', // Liechtenstein
  LK: 'LKA', // Sri Lanka
  LR: 'LBR', // Liberia
  LS: 'LSO', // Lesotho
  LT: 'LTU', // Lithuania
  LU: 'LUX', // Luxembourg
  LV: 'LVA', // Latvia
  LY: 'LBY', // Libya
  MA: 'MAR', // Morocco
  MC: 'MCO', // Monaco
  MD: 'MDA', // Moldova
  ME: 'MNE', // Montenegro
  MF: 'MAF', // Saint Martin
  MG: 'MDG', // Madagascar
  MH: 'MHL', // Marshall Islands
  MK: 'MKD', // North Macedonia
  ML: 'MLI', // Mali
  MM: 'MMR', // Myanmar
  MN: 'MNG', // Mongolia
  MO: 'MAC', // Macao
  MP: 'MNP', // Northern Mariana Islands
  MQ: 'MTQ', // Martinique
  MR: 'MRT', // Mauritania
  MS: 'MSR', // Montserrat
  MT: 'MLT', // Malta
  MU: 'MUS', // Mauritius
  MV: 'MDV', // Maldives
  MW: 'MWI', // Malawi
  MX: 'MEX', // Mexico
  MY: 'MYS', // Malaysia
  MZ: 'MOZ', // Mozambique
  NA: 'NAM', // Namibia
  NC: 'NCL', // New Caledonia
  NE: 'NER', // Niger
  NF: 'NFK', // Norfolk Island
  NG: 'NGA', // Nigeria
  NI: 'NIC', // Nicaragua
  NL: 'NLD', // Netherlands
  NO: 'NOR', // Norway
  NP: 'NPL', // Nepal
  NR: 'NRU', // Nauru
  NU: 'NIU', // Niue
  NZ: 'NZL', // New Zealand
  OM: 'OMN', // Oman
  PA: 'PAN', // Panama
  PE: 'PER', // Peru
  PF: 'PYF', // French Polynesia
  PG: 'PNG', // Papua New Guinea
  PH: 'PHL', // Philippines
  PK: 'PAK', // Pakistan
  PL: 'POL', // Poland
  PM: 'SPM', // Saint Pierre and Miquelon
  PN: 'PCN', // Pitcairn
  PR: 'PRI', // Puerto Rico
  PS: 'PSE', // Palestine
  PT: 'PRT', // Portugal
  PW: 'PLW', // Palau
  PY: 'PRY', // Paraguay
  QA: 'QAT', // Qatar
  RE: 'REU', // Réunion
  RO: 'ROU', // Romania
  RS: 'SRB', // Serbia
  RU: 'RUS', // Russia
  RW: 'RWA', // Rwanda
  SA: 'SAU', // Saudi Arabia
  SB: 'SLB', // Solomon Islands
  SC: 'SYC', // Seychelles
  SD: 'SDN', // Sudan
  SE: 'SWE', // Sweden
  SG: 'SGP', // Singapore
  SH: 'SHN', // Saint Helena
  SI: 'SVN', // Slovenia
  SJ: 'SJM', // Svalbard and Jan Mayen
  SK: 'SVK', // Slovakia
  SL: 'SLE', // Sierra Leone
  SM: 'SMR', // San Marino
  SN: 'SEN', // Senegal
  SO: 'SOM', // Somalia
  SR: 'SUR', // Suriname
  SS: 'SSD', // South Sudan
  ST: 'STP', // São Tomé and Príncipe
  SV: 'SLV', // El Salvador
  SX: 'SXM', // Sint Maarten
  SY: 'SYR', // Syria
  SZ: 'SWZ', // Eswatini
  TC: 'TCA', // Turks and Caicos Islands
  TD: 'TCD', // Chad
  TF: 'ATF', // French Southern Territories
  TG: 'TGO', // Togo
  TH: 'THA', // Thailand
  TJ: 'TJK', // Tajikistan
  TK: 'TKL', // Tokelau
  TL: 'TLS', // Timor-Leste
  TM: 'TKM', // Turkmenistan
  TN: 'TUN', // Tunisia
  TO: 'TON', // Tonga
  TR: 'TUR', // Turkey
  TT: 'TTO', // Trinidad and Tobago
  TV: 'TUV', // Tuvalu
  TW: 'TWN', // Taiwan
  TZ: 'TZA', // Tanzania
  UA: 'UKR', // Ukraine
  UG: 'UGA', // Uganda
  UM: 'UMI', // United States Minor Outlying Islands
  US: 'USA', // United States
  UY: 'URY', // Uruguay
  UZ: 'UZB', // Uzbekistan
  VA: 'VAT', // Vatican City
  VC: 'VCT', // Saint Vincent and the Grenadines
  VE: 'VEN', // Venezuela
  VG: 'VGB', // Virgin Islands (British)
  VI: 'VIR', // Virgin Islands (U.S.)
  VN: 'VNM', // Vietnam
  VU: 'VUT', // Vanuatu
  WF: 'WLF', // Wallis and Futuna
  WS: 'WSM', // Samoa
  YE: 'YEM', // Yemen
  YT: 'MYT', // Mayotte
  ZA: 'ZAF', // South Africa
  ZM: 'ZMB', // Zambia
  ZW: 'ZWE', // Zimbabwe
};

export default function LoginScreen() {
  const [countryCode, setCountryCode] = useState('CI');
  const [country, setCountry] = useState({
    callingCode: ['225'],
    cca2: 'CI',
    cca3: 'CIV',
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) return;

    setLoading(true);
    // Ensure cca3 is set, fallback to alpha2ToAlpha3 or cca2
    const cca3 = country.cca3 || alpha2ToAlpha3[country.cca2] || country.cca2;
    // Ensure callingCode is valid, fallback to empty string if undefined
    const callingCode = country.callingCode?.[0] || '';
    // Prepend calling code to phone number
    const fullPhoneNumber = `+${callingCode}${phoneNumber}`;

    try {
      console.log('Selected country:', { cca2: country.cca2, cca3, callingCode });
      console.log('Full phone number:', fullPhoneNumber);

      // Store the raw phone number (without calling code) if required by your API
      await storePhoneNumber(phoneNumber);
      // Send OTP request with full phone number (including calling code)
      await requestOtp(fullPhoneNumber, cca3);

      router.push({
        pathname: '/(auth)/verification',
        params: {
          phoneNumber: fullPhoneNumber,
        },
      });
    } catch (error) {
      console.error('Erreur d’envoi OTP :', error);
      // Optionally show a toast or alert for user feedback
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View className="flex-1 justify-center items-center min-h-[40vh]">
            <Image
              source={require('~/assets/images/logo.png')}
              className="w-20 h-20"
              resizeMode="contain"
            />
          </View>

          {/* Formulaire */}
          <View className="bg-white rounded-t-3xl px-6 py-8">
            <Text className="text-2xl font-bold text-center mb-2 text-gray-900">
              Create an account
            </Text>
            <Text className="text-gray-600 text-center mb-8">
              Sign up your account to continue
            </Text>

            <Text className="text-gray-900 font-medium mb-4">
              What is your phone number?
            </Text>

            <View className="flex-row items-center border border-gray-300 rounded-lg mb-8">
              <TouchableOpacity
                className="flex-row items-center px-4 py-4 border-r border-gray-300"
                onPress={() => setShowCountryPicker(true)}
              >
                <CountryPicker
                  countryCode={countryCode}
                  withFilter
                  withFlag
                  withCallingCode
                  withCountryNameButton={false}
                  onSelect={(selectedCountry) => {
                    console.log('Country selected:', selectedCountry);
                    setCountry({
                      callingCode: selectedCountry.callingCode || [''],
                      cca2: selectedCountry.cca2,
                      cca3: selectedCountry.cca3 || alpha2ToAlpha3[selectedCountry.cca2] || selectedCountry.cca2,
                    });
                    setCountryCode(selectedCountry.cca2);
                    setShowCountryPicker(false);
                  }}
                  visible={showCountryPicker}
                  onClose={() => setShowCountryPicker(false)}
                />
                <Text className="ml-2 text-gray-900">
                  +{country.callingCode?.[0] || ''}
                </Text>
              </TouchableOpacity>

              <TextInput
                className="flex-1 px-4 py-4 text-gray-900"
                placeholder=""
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>

            {/* CGU */}
            <Text className="text-gray-500 text-center mb-6">
              By continuing, you agree to WeSapp{' '}
              <Text className="font-semibold text-gray-700">Privacy Policy</Text>{' '}
              and{' '}
              <Text className="font-semibold text-gray-700">General Terms</Text>{' '}
              of use
            </Text>

            {/* Bouton d'envoi */}
            <TouchableOpacity
              className={`bg-teal-600 py-4 rounded-lg ${loading ? 'opacity-50' : ''}`}
              onPress={handleSendCode}
              disabled={!phoneNumber.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center font-semibold text-lg">
                  Send code
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}