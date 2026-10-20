import { useEffect } from "react";
import { LanguagePicker, useLanguage } from "../language.jsx";

const PAGES = {
  faq: {
    title: ["Frequently asked questions", "ተደጋጋሚ ጥያቄዎች"],
    intro: ["Clear answers to common questions about using Chronicle.", "Chronicleን ስለመጠቀም ለሚነሱ የተለመዱ ጥያቄዎች ግልጽ መልሶች።"],
    entries: [
      ["Is Chronicle free to use?", "Yes. You can create an account, explore stories, and take part in the community at no charge. Some features may depend on service availability.", "Chronicleን በነፃ መጠቀም ይቻላል?", "አዎ። መለያ መፍጠር፣ ታሪኮችን ማሰስ እና በማህበረሰቡ መሳተፍ በነፃ ይቻላል። አንዳንድ አገልግሎቶች በመድረኩ አቅርቦት ላይ ሊመሰረቱ ይችላሉ።"],
      ["How do I create an account?", "Select Join free and register with your name, email address, and password. Google sign-in is available when enabled.", "መለያ እንዴት እፈጥራለሁ?", "በነፃ ይቀላቀሉን ይምረጡና በስምዎ፣ በኢሜይል አድራሻዎ እና በይለፍ ቃል ይመዝገቡ። ከነቃ በGoogle መግባትም ይቻላል።"],
      ["Can I write in Amharic or English?", "Yes. Write stories, titles, and comments in either language. The language control changes interface text; it does not translate or edit your contributions.", "በአማርኛ ወይም በእንግሊዝኛ መጻፍ እችላለሁ?", "አዎ። ታሪኮችን፣ ርዕሶችን እና አስተያየቶችን በሁለቱም ቋንቋዎች መጻፍ ይችላሉ። የቋንቋ መቀየሪያው የመድረኩን ጽሑፎች ይቀይራል፤ የእርስዎን አስተዋጽኦ አይተረጉምም ወይም አያስተካክልም።"],
      ["How do I publish a story?", "Choose Create story, add your text or media, and submit it for review. Stories appear publicly after they are approved.", "ታሪክ እንዴት አሳትማለሁ?", "ታሪክ ይፍጠሩን ይምረጡ፣ ጽሑፍ ወይም ሚዲያ ያክሉና ለግምገማ ያስገቡ። ታሪኮች ከተፈቀዱ በኋላ ለሕዝብ ይታያሉ።"],
      ["Can I share photos and video?", "Yes. You can add supported images or video to a story. Please only upload material you own or have permission to share.", "ፎቶዎችንና ቪዲዮዎችን ማጋራት እችላለሁ?", "አዎ። የሚደገፉ ምስሎችን ወይም ቪዲዮዎችን በታሪክዎ ላይ ማከል ይችላሉ። የራስዎ የሆነ ወይም ለማጋራት ፈቃድ ያለዎትን ብቻ ይጫኑ።",],
    ],
  },
  terms: {
    title: ["Terms of service", "የአገልግሎት ውሎች"],
    intro: ["These terms explain the rules for using Chronicle.", "እነዚህ ውሎች Chronicleን ለመጠቀም የሚከተሉትን ደንቦች ያብራራሉ።"],
    sections: [
      ["Using Chronicle", "By creating an account or using Chronicle, you agree to these terms and to the Community Policy. You must provide accurate account details, keep your sign-in credentials secure, and use the service lawfully. You are responsible for activity carried out through your account.", "Chronicleን መጠቀም", "መለያ በመፍጠር ወይም Chronicleን በመጠቀም እነዚህን ውሎችና የማህበረሰብ ፖሊሲን ተቀብለዋል። ትክክለኛ የመለያ መረጃ ያቅርቡ፣ የመግቢያ መረጃዎን በደህና ይያዙ፣ እና አገልግሎቱን በሕጋዊ መንገድ ይጠቀሙ። በመለያዎ የሚፈጸም እንቅስቃሴ የእርስዎ ኃላፊነት ነው።"],
      ["Your contributions", "You keep ownership of the stories, comments, and media you create. When you submit content, you allow Chronicle to store, display, and distribute it as needed to operate the service and show it to the audience you choose. You confirm that you have the rights and permissions needed to share it. You can edit or remove your content where those controls are available.", "የእርስዎ አስተዋጽኦዎች", "የፈጠሯቸው ታሪኮች፣ አስተያየቶች እና ሚዲያዎች ባለቤትነት የእርስዎ ነው። ይዘት ሲያስገቡ፣ Chronicle አገልግሎቱን ለማስኬድና ለመረጡት ተመልካች ለማሳየት እንዲያስቀምጠው፣ እንዲያሳየው እና እንዲያሰራጨው ፈቃድ ይሰጣሉ። ለማጋራት አስፈላጊው መብትና ፈቃድ እንዳለዎት ያረጋግጣሉ። ተገቢው ቁጥጥር ባለበት ይዘትዎን ማስተካከል ወይም ማስወገድ ይችላሉ።"],
      ["Review and availability", "Stories may be reviewed before publication. Chronicle may restrict or remove content or accounts that breach these terms or the Community Policy. We work to keep the service available, but do not promise uninterrupted access or that every feature will always be available.", "ግምገማና አቅርቦት", "ታሪኮች ከመታተማቸው በፊት ሊገመገሙ ይችላሉ። Chronicle እነዚህን ውሎች ወይም የማህበረሰብ ፖሊሲን የሚጥሱ ይዘቶችን ወይም መለያዎችን ሊገድብ ወይም ሊያስወግድ ይችላል። አገልግሎቱ እንዲቀጥል እንጥራለን፤ ሆኖም ያልተቋረጠ መዳረሻ ወይም ሁሉም ባህሪያት ሁልጊዜ እንደሚኖሩ ቃል አንገባም።"],
      ["Updates and contact", "We may update these terms as the service changes. The current version is posted on this page. Continued use after an update means you accept the revised terms. Use the contact method provided in the service to ask a question about these terms.", "ዝማኔዎችና ጥያቄዎች", "አገልግሎቱ ሲሻሻል እነዚህን ውሎች ልናዘምን እንችላለን። የአሁኑ ስሪት በዚህ ገጽ ላይ ይታተማል። ከዝማኔ በኋላ መጠቀምዎን መቀጠል የተሻሻሉትን ውሎች መቀበልዎን ያመለክታል። ስለ ውሎቹ ጥያቄ ለማቅረብ በአገልግሎቱ ውስጥ የቀረበውን የግንኙነት መንገድ ይጠቀሙ።"],
    ],
  },
  privacy: {
    title: ["Privacy policy", "የግላዊነት ፖሊሲ"],
    intro: ["This policy describes the account and activity information Chronicle uses to run the service.", "ይህ ፖሊሲ Chronicle አገልግሎቱን ለማስኬድ የሚጠቀምባቸውን የመለያና የእንቅስቃሴ መረጃዎች ያብራራል።"],
    sections: [
      ["Information you provide", "When you register, Chronicle collects the name and email address associated with your account. It also stores the stories, comments, reactions, and media you choose to submit.", "የሚያቀርቡት መረጃ", "ሲመዘገቡ Chronicle ከመለያዎ ጋር የተያያዘውን ስምና የኢሜይል አድራሻ ይሰበስባል። እንዲሁም ለማጋራት የመረጧቸውን ታሪኮች፣ አስተያየቶች፣ ምላሾችና ሚዲያዎች ያስቀምጣል።"],
      ["How information is used", "We use this information to create and secure your account, display and moderate community content, provide site features, and maintain the service. Public stories and comments may be visible to other users and visitors.", "መረጃው እንዴት እንደሚጠቀም", "ይህን መረጃ መለያዎን ለመፍጠርና ለመጠበቅ፣ የማህበረሰብ ይዘትን ለማሳየትና ለመቆጣጠር፣ የድረ ገጹን ባህሪያት ለማቅረብ እና አገልግሎቱን ለማስቀጠል እንጠቀማለን። ለሕዝብ የተጋሩ ታሪኮችና አስተያየቶች ለሌሎች ተጠቃሚዎችና ጎብኚዎች ሊታዩ ይችላሉ።"],
      ["Storage and service providers", "Account and content data are stored by the services configured to operate Chronicle. Sign-in, email, hosting, and media providers may process the information needed to deliver their features. Their handling may also be governed by their own privacy notices.", "ማከማቻና አገልግሎት ሰጪዎች", "የመለያና የይዘት መረጃዎች Chronicleን ለማስኬድ በተዋቀሩ አገልግሎቶች ይቀመጣሉ። የመግቢያ፣ የኢሜይል፣ የማስተናገድና የሚዲያ አቅራቢዎች ባህሪያቸውን ለማቅረብ አስፈላጊውን መረጃ ሊያስኬዱ ይችላሉ። አያያዛቸው በራሳቸው የግላዊነት ማስታወቂያዎችም ሊመራ ይችላል።"],
      ["Your choices and safety", "Keep your password private and avoid including sensitive personal information in public content. You can edit or remove content where those controls are available. Information may remain in backups or records where needed for security, moderation, or legal obligations.", "ምርጫዎችዎና ደህንነት", "የይለፍ ቃልዎን ሚስጥር ይጠብቁ፤ በሕዝብ ይዘት ውስጥም ስሱ የግል መረጃ ከማካተት ይቆጠቡ። ቁጥጥሩ ባለበት ይዘትዎን ማስተካከል ወይም ማስወገድ ይችላሉ። ለደህንነት፣ ለይዘት ቁጥጥር ወይም ለሕጋዊ ግዴታ ሲያስፈልግ መረጃ በተቀማጭ ቅጂዎች ወይም መዝገቦች ውስጥ ሊቆይ ይችላል።"],
      ["Changes", "We may revise this policy when Chronicle changes. The latest version will be available on this page.", "ለውጦች", "Chronicle ሲሻሻል ይህን ፖሊሲ ልናሻሽል እንችላለን። የቅርብ ጊዜው ስሪት በዚህ ገጽ ላይ ይገኛል።"],
    ],
  },
  "community-policy": {
    title: ["Community policy", "የማህበረሰብ ፖሊሲ"],
    intro: ["Help make Chronicle a thoughtful, trustworthy place to share history.", "Chronicle ታሪክን ለማጋራት አስተዋይና አስተማማኝ ቦታ እንዲሆን ያግዙ።"],
    sections: [
      ["Be respectful", "Discuss ideas and historical interpretations without harassment, threats, hate, or personal attacks. Respect the people and communities represented in the history you share.", "አክብሮት ያሳዩ", "ሀሳቦችንና የታሪክ ትርጓሜዎችን ያለ ማስጨነቅ፣ ዛቻ፣ ጥላቻ ወይም የግል ስድብ ይወያዩ። በሚያጋሩት ታሪክ ውስጥ ለሚወከሉ ሰዎችና ማህበረሰቦች አክብሮት ያሳዩ።"],
      ["Be accurate and give credit", "Use reliable sources where possible. Credit authors, archives, and image creators. Clearly distinguish established evidence from interpretation, uncertainty, or personal opinion. Do not present invented material as fact.", "ትክክለኛ መረጃ ይጠቀሙና ምንጭ ይጥቀሱ", "በተቻለ መጠን አስተማማኝ ምንጮችን ይጠቀሙ። ደራሲዎችን፣ ማህደሮችንና የምስል ፈጣሪዎችን ይጥቀሱ። የተረጋገጠ ማስረጃን ከትርጓሜ፣ ከእርግጠኝነት እጥረት ወይም ከግል አስተያየት በግልጽ ይለዩ። የፈጠራ ይዘትን እንደ እውነታ አያቅርቡ።"],
      ["Share responsibly", "Only post text, images, and video you created or have permission to share. Do not expose private information, impersonate others, spam, or use Chronicle to break the law.", "በኃላፊነት ያጋሩ", "የፈጠሯቸውን ወይም ለማጋራት ፈቃድ ያለዎትን ጽሑፎች፣ ምስሎችና ቪዲዮዎች ብቻ ይለጥፉ። የግል መረጃን አያጋልጡ፣ ሌላ ሰውን አይመስሉ፣ አይስፓሙ፣ Chronicleንም ሕግ ለመጣስ አይጠቀሙ።"],
      ["Review and action", "Stories are reviewed before publication. Chronicle may decline, remove, or restrict content that breaks these guidelines. Repeated or serious violations may result in account restrictions. Use the reporting controls when available to flag content that concerns you.", "ግምገማና እርምጃ", "ታሪኮች ከመታተማቸው በፊት ይገመገማሉ። Chronicle እነዚህን መመሪያዎች የሚጥስ ይዘት ሊከለክል፣ ሊያስወግድ ወይም ሊገድብ ይችላል። ተደጋጋሚ ወይም ከባድ ጥሰቶች የመለያ ገደብ ሊያስከትሉ ይችላሉ። ሲኖር የሪፖርት መቆጣጠሪያውን ተጠቅመው ያሳስብዎትን ይዘት ያሳውቁ።"],
    ],
  },
};

export default function ResourcePage({ type }) {
  const { language } = useLanguage();
  const page = PAGES[type];
  const am = language === "am";
  useEffect(() => {
    if (page) document.title = `${page.title[am ? 1 : 0]} · Chronicle`;
  }, [page, am]);
  if (!page) return null;
  return (
    <div className="resource-page">
      <header className="resource-nav"><a className="logo" href="/"><img className="logo__mark" src="/favicon.svg" alt="" /> Chronicle</a><nav aria-label={am ? "የመድረክ አገናኞች" : "Site links"}><a href="/faq">{am ? "ጥያቄዎች" : "FAQ"}</a><a href="/terms">{am ? "ውሎች" : "Terms"}</a><a href="/privacy">{am ? "ግላዊነት" : "Privacy"}</a><a href="/community-policy">{am ? "የማህበረሰብ ፖሊሲ" : "Community policy"}</a></nav><LanguagePicker /></header>
      <main className="resource-content" lang={am ? "am" : "en"}>
        <a className="resource-back" href="/">← {am ? "ወደ መነሻ ገጽ ተመለስ" : "Back to home"}</a>
        <span className="eyebrow">{am ? "CHRONICLE · የእገዛ ማዕከል" : "CHRONICLE · HELP & POLICIES"}</span>
        <h1>{page.title[am ? 1 : 0]}</h1><p className="resource-intro">{page.intro[am ? 1 : 0]}</p>
        {page.entries ? <div className="resource-faq">{page.entries.map(([question, answer, qAm, aAm]) => <details key={question}><summary>{am ? qAm : question}</summary><p>{am ? aAm : answer}</p></details>)}</div> : <div className="resource-sections">{page.sections.map(([heading, copy, headingAm, copyAm]) => <section key={heading}><h2>{am ? headingAm : heading}</h2><p>{am ? copyAm : copy}</p></section>)}</div>}
        <p className="resource-updated">{am ? "የመጨረሻ ዝማኔ፦ ጥቅምት 20፣ 2026" : "Last updated: October 20, 2026"}</p>
      </main>
      <footer className="resource-footer"><a href="/">Chronicle</a><nav><a href="/faq">FAQ</a><a href="/terms">Terms</a><a href="/privacy">Privacy</a><a href="/community-policy">Community policy</a></nav><small>© {new Date().getFullYear()} Chronicle</small></footer>
    </div>
  );
}
