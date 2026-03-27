export interface PresetCalendar {
  id: string;
  label: string;
  cohort: string;
  url: string;
}

export const PRESET_CALENDARS: PresetCalendar[] = [
  {
    id: "ptivis25a",
    label: "PTIVIS25A",
    cohort: "PTIVIS25",
    url: "http://lukkari.turkuamk.fi/ical.php?hash=9385A6CBC6B79C3DDCE6B2738B5C1B882A6D64CA",
  },
  {
    id: "ptivis25b",
    label: "PTIVIS25B",
    cohort: "PTIVIS25",
    url: "http://lukkari.turkuamk.fi/ical.php?hash=6DDA4ADC8FD96BC395D68B8B15340B543D74E3D8",
  },
  {
    id: "ptivis25c",
    label: "PTIVIS25C",
    cohort: "PTIVIS25",
    url: "http://lukkari.turkuamk.fi/ical.php?hash=E4AC87D135AF921A83B677DD15A19E6119DDF0BB",
  },
  {
    id: "ptivis25d",
    label: "PTIVIS25D",
    cohort: "PTIVIS25",
    url: "http://lukkari.turkuamk.fi/ical.php?hash=E8F13D455EA82E8A7D0990CF6983BBE61AD839A7",
  },
  {
    id: "ptivis25e",
    label: "PTIVIS25E",
    cohort: "PTIVIS25",
    url: "http://lukkari.turkuamk.fi/ical.php?hash=346C225AD26BD6966FC656F8E77B5A3EA38A73B5",
  },
  {
    id: "ptivis25f",
    label: "PTIVIS25F",
    cohort: "PTIVIS25",
    url: "http://lukkari.turkuamk.fi/ical.php?hash=6EAF3A6D4FC2B07836C2B742EC923629839CA0B7",
  },
  {
    id: "ptivis26a",
    label: "PTIVIS26A",
    cohort: "PTIVIS26",
    url: "http://lukkari.turkuamk.fi/ical.php?hash=37824948FF7C349EC0A154909FE3FB237A6446D7",
  },
  {
    id: "ptivis26b",
    label: "PTIVIS26B",
    cohort: "PTIVIS26",
    url: "http://lukkari.turkuamk.fi/ical.php?hash=47109DC2CD358B58AE999F64408E8FA3BCBB2CA7",
  },
  {
    id: "ptivis26c",
    label: "PTIVIS26C",
    cohort: "PTIVIS26",
    url: "http://lukkari.turkuamk.fi/ical.php?hash=ACBB892D8221D6EE153DE00D94602C8BAA7AD575",
  },
  {
    id: "ptivis26d",
    label: "PTIVIS26D",
    cohort: "PTIVIS26",
    url: "http://lukkari.turkuamk.fi/ical.php?hash=BE2B91236E7A4600197DC6BAB879A1EAAB8A2734",
  },
  {
    id: "ptivis26e",
    label: "PTIVIS26E",
    cohort: "PTIVIS26",
    url: "http://lukkari.turkuamk.fi/ical.php?hash=5AF633B7505DF0D5805BA6A67D72033580DED219",
  },
  {
    id: "ptivis26f",
    label: "PTIVIS26F",
    cohort: "PTIVIS26",
    url: "http://lukkari.turkuamk.fi/ical.php?hash=A0AB574A5D93FD2F9428E74110810F97514D3651",
  },
];

export const PRESET_CALENDAR_GROUPS = PRESET_CALENDARS.reduce<
  Record<string, PresetCalendar[]>
>((groups, preset) => {
  if (!groups[preset.cohort]) {
    groups[preset.cohort] = [];
  }
  groups[preset.cohort].push(preset);
  return groups;
}, {});
