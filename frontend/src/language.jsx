import { useEffect, useState } from "react";
import historicalTranslations from "./historicalTranslations.js";

const KEY = "chronicle_language";
const translations = {
  "Write your post in English or Amharic. Your words will be published exactly as you write them.": "ጽሑፍዎን በእንግሊዝኛ ወይም በአማርኛ ይጻፉ። ቃላትዎ እንደጻፉዋቸው ይታተማሉ።",
  "Features": "ባህሪያት", "Timeline": "የጊዜ ሰሌዳ", "Community": "ማህበረሰብ", "Book Mode": "የመጽሐፍ ሁነታ",
  "Log in": "ግባ", "Join free": "በነፃ ይቀላቀሉ", "Sign out": "ውጣ", "Home": "መነሻ", "Language": "ቋንቋ",
  "Every moment ever lived.": "ከተኖሩት ጊዜያት ሁሉ።", "One story at a time.": "አንድ ታሪክ በአንድ ጊዜ።",
  "The social network for history lovers": "የታሪክ ወዳጆች ማህበራዊ መድረክ",
  "Post history events with text, images, and video. Explore them on a living timeline or read them like a book. Join a community that can't stop learning.": "የታሪክ ክስተቶችን በጽሑፍ፣ በምስል እና በቪዲዮ ያጋሩ። በዘመናዊ የጊዜ ሰሌዳ ያስሱ ወይም እንደ መጽሐፍ ያንብቡ። መማርን ከማያቋርጥ ማህበረሰብ ጋር ይቀላቀሉ።",
  "Start exploring — it's free": "ማሰስ ይጀምሩ — በነፃ", "Start exploring â€” it's free": "ማሰስ ይጀምሩ — በነፃ", "See how it works": "እንዴት እንደሚሰራ ይመልከቱ",
  "Welcome back": "እንኳን ተመለሱ", "Your story starts here": "ታሪክዎ እዚህ ይጀምራል", "Find your way back": "መለያዎን ያግኙ", "Choose a new password": "አዲስ የይለፍ ቃል ይምረጡ",
  "Sign in and continue exploring the past.": "ይግቡና ያለፈውን ማሰስ ይቀጥሉ።", "Create your free Chronicle account.": "የChronicle መለያዎን በነፃ ይፍጠሩ።",
  "A world of stories awaits": "የታሪኮች ዓለም ይጠብቅዎታል", "Your name": "ስምዎ", "Email address": "የኢሜይል አድራሻ", "Password": "የይለፍ ቃል", "New password": "አዲስ የይለፍ ቃል",
  "Forgot password?": "የይለፍ ቃልዎን ረሱ?", "Please wait…": "እባክዎ ይጠብቁ…", "Please waitâ€¦": "እባክዎ ይጠብቁ…", "Create account": "መለያ ይፍጠሩ",
  "Check your email": "ኢሜይልዎን ይመልከቱ", "Already have an account?": "መለያ አለዎት?", "New to Chronicle?": "Chronicleን አዲስ ነዎት?", "Create an account": "መለያ ይፍጠሩ", "By continuing, you agree to Chronicle's": "በመቀጠል የChronicleን ውሎች እና የግላዊነት መመሪያ ይቀበላሉ።",
  "Discover": "ያስሱ", "Create story": "ታሪክ ይፍጠሩ", "Search stories": "ታሪኮችን ይፈልጉ", "My account": "መለያዬ", "For you": "ለእርስዎ", "Explore timeline": "የጊዜ ሰሌዳን ያስሱ", "Community feed": "የማህበረሰብ ዜና", "Reading room": "የንባብ ክፍል"
};
Object.assign(translations, historicalTranslations);

Object.assign(translations, {
  "Loved by": "የሚወዱት", "history fans worldwide": "በዓለም ዙሪያ ያሉ የታሪክ ወዳጆች", "Featured moment": "የተመረጠ ታሪካዊ ክስተት", "A simple way to begin": "ለመጀመር ቀላል መንገድ",
  "How Chronicle works.": "Chronicle እንዴት ይሰራል?", "Go from curious reader to part of the history conversation in three steps.": "በሶስት እርምጃዎች ከጉጉት አንባቢነት ወደ ታሪክ ውይይት ተሳታፊነት ይሂዱ።",
  "Why Chronicle": "ለምን Chronicle?", "History, finally built for how you scroll.": "ታሪክን በሚያስሱበት መንገድ የተዘጋጀ መድረክ።", "Everything you love about social media, with the past as the main character.": "ስለ ማህበራዊ ሚዲያ የሚወዱት ሁሉ፣ ያለፈው ዘመን ዋና ተዋናይ ሆኖ።",
  "Timeline view": "የጊዜ ሰሌዳ እይታ", "Walk through time.": "በዘመናት ውስጥ ይጓዙ።", "Pick an era and watch history unfold event by event, with photos and video.": "ዘመን ይምረጡና ታሪክ ክስተት በክስተት ሲገለጥ በፎቶና ቪዲዮ ይመልከቱ።",
  "Explore this moment": "ይህን ክስተት ያስሱ", "Community feed": "የማህበረሰብ ዜና", "Your feed, but make it history.": "የእርስዎ ዜና ማሰራጫ፣ በታሪክ የተሞላ።", "Short stories, jaw-dropping facts, and rare images from people who love the past.": "አጫጭር ታሪኮች፣ አስገራሚ እውነታዎችና ያለፈውን ከሚወዱ ሰዎች የተገኙ ልዩ ምስሎች።",
  "Book Mode": "የመጽሐፍ ሁነታ", "Turn history into a page-turner.": "ታሪክን ገጽ በገጽ የሚያነቡት መጽሐፍ ያድርጉት።", "Every event can become a chapter. Flip pages, watch embedded video, and zoom into images, all in a beautiful reading experience that feels like holding a book.": "እያንዳንዱ ክስተት ምዕራፍ ሊሆን ይችላል። ገጾችን ይገልጡ፣ የተካተቱ ቪዲዮዎችን ይመልከቱ፣ ምስሎችንም ያጉሉ፤ መጽሐፍ የያዙ ያህል ውብ የንባብ ተሞክሮ ያግኙ።",
  "Chapters built from real community events": "ከእውነተኛ የማህበረሰብ ክስተቶች የተዘጋጁ ምዕራፎች", "Images and video right inside the pages": "በገጾቹ ውስጥ በቀጥታ የተካተቱ ምስሎችና ቪዲዮዎች", "Save, bookmark, and continue where you stopped": "ያስቀምጡ፣ ዕልባት ያድርጉ፣ ካቆሙበትም ይቀጥሉ", "Open a book": "መጽሐፍ ይክፈቱ",
  "Loved worldwide": "በዓለም ዙሪያ የተወደደ", "Don't just take our word for it.": "በእኛ ቃል ብቻ አይመኑ።", "Your chapter starts today.": "የእርስዎ ምዕራፍ ዛሬ ይጀምራል።", "Join thousands of people sharing the stories that shaped our world.": "ዓለማችንን የቀረጹ ታሪኮችን ከሚያጋሩ ሺዎች ጋር ይቀላቀሉ።",
  "Join Chronicle": "Chronicleን ይቀላቀሉ", "I already have an account": "መለያ አለኝ", "Free to join. Your next discovery is waiting.": "መቀላቀል ነፃ ነው። ቀጣዩ ግኝትዎ ይጠብቅዎታል።", "Our purpose": "ዓላማችን", "About Chronicle": "ስለ Chronicle",
  "Chronicle is a community for people who love history. Share the moments that shaped our world, explore them through a living timeline, and read stories in a book-inspired format.": "Chronicle ታሪክን ለሚወዱ ሰዎች የተዘጋጀ ማህበረሰብ ነው። ዓለማችንን የቀረጹ ክስተቶችን ያጋሩ፣ በዘመናዊ የጊዜ ሰሌዳ ያስሱ፣ በመጽሐፍ ቅርጽ የቀረቡ ታሪኮችንም ያንብቡ።",
  "See how it works": "እንዴት እንደሚሰራ ይመልከቱ", "Where history lives.": "ታሪክ የሚኖርበት ቦታ።", "All rights reserved.": "መብቱ በሙሉ የተጠበቀ ነው።", "Explore": "ያስሱ", "About": "ስለ እኛ", "FAQ": "ተደጋጋሚ ጥያቄዎች", "Policies": "ፖሊሲዎች", "Terms of service": "የአገልግሎት ውሎች", "Privacy policy": "የግላዊነት ፖሊሲ", "Community policy": "የማህበረሰብ ፖሊሲ",
  "Check your email": "ኢሜይልዎን ይመልከቱ", "or continue with": "ወይም ይህን ይቀጥሉ", "Continue with Google": "በGoogle ይቀጥሉ", "Loading secure Google sign-in…": "የደህንነት Google መግቢያ በመጫን ላይ…", "Google sign-in is unavailable. You can still use your email and password.": "የGoogle መግቢያ አልተገኘም። አሁንም ኢሜይልዎንና የይለፍ ቃልዎን መጠቀም ይችላሉ።", "Terms and Privacy Policy": "ውሎችና የግላዊነት ፖሊሲ",
  "YOUR CONTRIBUTIONS": "የእርስዎ አስተዋጽኦዎች", "My assignments": "የእኔ ተግባራት", "open": "ክፍት", "Assigned by": "የመደበው", "Progress": "ሂደት", "Not started": "አልተጀመረም", "In progress": "በሂደት ላይ", "Completed": "ተጠናቋል", "Notifications": "ማሳወቂያዎች", "Mark all as read": "ሁሉንም እንደተነበቡ ምልክት አድርግ", "No notifications yet. Likes and comments on your stories will appear here.": "እስካሁን ማሳወቂያ የለም። በታሪኮችዎ ላይ የሚደረጉ ውደዳዎችና አስተያየቶች እዚህ ይታያሉ።",
  "YOUR CHRONICLE": "የእርስዎ Chronicle", "Create a story": "ታሪክ ይፍጠሩ", "Administration": "አስተዳደር", "1 day streak": "የ1 ቀን ተከታታይ ጉዞ", "Keep your curiosity going": "ጉጉትዎን ይቀጥሉ", "TODAY'S PROMPT": "የዛሬ ጥያቄ", "What moment in history would you love to witness?": "የትኛውን ታሪካዊ ክስተት በቀጥታ ማየት ይፈልጋሉ?", "Explore the stories →": "ታሪኮቹን ያስሱ →",
  "Back to your Chronicle": "ወደ Chronicleዎ ተመለስ", "THE CHRONICLE ARCHIVE": "የChronicle ማህደር", "History unfolds, moment by moment.": "ታሪክ ክስተት በክስተት ይገለጣል።", "Explore curated landmarks and visual stories shared by the community.": "የተመረጡ ታሪካዊ ቦታዎችንና ማህበረሰቡ ያጋራቸውን ምስላዊ ታሪኮች ያስሱ።", "Build a timeline": "የጊዜ ሰሌዳ ይገንቡ", "Open story ↗": "ታሪክ ይክፈቱ ↗", "No community timelines yet. Start one with the “Build a timeline” button.": "እስካሁን የማህበረሰብ የጊዜ ሰሌዳ የለም። “የጊዜ ሰሌዳ ይገንቡ” የሚለውን ቁልፍ ተጠቅመው ይጀምሩ።",
  "EDITOR'S SELECTION": "የአርታዒ ምርጫ", "Milestones across the ages.": "በዘመናት የተከናወኑ ታላላቅ ክስተቶች።", "A few turning points to begin your journey through the Chronicle archive.": "በChronicle ማህደር ውስጥ ጉዞዎን ለመጀመር ጥቂት ወሳኝ ክስተቶች።", "Welcome back,": "እንኳን ተመለሱ፣", "A little more wonder from the past is waiting for you.": "ከያለፈው ታሪክ ትንሽ ተጨማሪ አስደናቂ ነገር ይጠብቅዎታል።", "current streak": "የአሁኑ ተከታታይ ቀናት",
  "TODAY'S DISCOVERY · ANCIENT EGYPT": "የዛሬ ግኝት · ጥንታዊ ግብፅ", "How did the Great Pyramid stand for 4,500 years?": "ታላቁ ፒራሚድ ለ4,500 ዓመታት እንዴት ቆየ?", "Explore the ingenuity, people, and ambition behind one of humanity's most enduring monuments.": "ከሰው ልጅ ዘላቂ ሐውልቶች አንዱን ያቆሙትን ብልሃት፣ ሰዎችና ዓላማ ያስሱ።", "Explore this story": "ይህን ታሪክ ያስሱ", "years to explore": "የሚያስሱት ዓመታት", "countries represented": "የተወከሉ አገሮች", "stories in your reading list": "በንባብ ዝርዝርዎ ያሉ ታሪኮች",
  "A JOURNEY THROUGH TIME": "በዘመናት ውስጥ የሚደረግ ጉዞ", "History, in its own words.": "ታሪክ፣ በራሱ ቃላት።", "Follow the moments that changed how people lived, built, and imagined the future.": "ሰዎች የኖሩበትን፣ የገነቡትንና ወደፊትን ያሰቡበትን መንገድ የቀየሩ ክስተቶችን ይከታተሉ።", "Explore by era": "በዘመን ያስሱ", "FROM THE COMMUNITY": "ከማህበረሰቡ", "Stories worth your time": "ጊዜዎን የሚገቡ ታሪኮች", "Explore all": "ሁሉንም ያስሱ", "Your community feed starts with a story.": "የማህበረሰብ ዜና ማሰራጫዎ በአንድ ታሪክ ይጀምራል።", "Share a historical moment, then like, discuss, and pass it along.": "ታሪካዊ ክስተት ያጋሩ፣ ከዚያ ይውደዱ፣ ይወያዩና ለሌሎች ያጋሩ።", "Create your first story →": "የመጀመሪያ ታሪክዎን ይፍጠሩ →", "PICK UP WHERE YOU LEFT OFF": "ካቆሙበት ይቀጥሉ", "A world between two covers.": "በሁለት ሽፋኖች መካከል ያለ ዓለም።", "Continue reading": "ማንበብ ይቀጥሉ", "Curiosity connects us across time.": "ጉጉት በዘመናት ሁሉ ያገናኘናል።",
  "Story title": "የታሪኩ ርዕስ", "Era": "ዘመን", "Year or date": "ዓመት ወይም ቀን", "Place": "ቦታ", "Timeline moments": "የጊዜ ሰሌዳ ክስተቶች", "At least two, in chronological order": "ቢያንስ ሁለት፣ በጊዜ ቅደም ተከተል", "Moment title": "የክስተቱ ርዕስ", "Short description": "አጭር መግለጫ", "Add a moment image": "የክስተቱን ምስል ያክሉ", "Add another moment": "ሌላ ክስተት ያክሉ", "Chapters": "ምዕራፎች", "Chapter title": "የምዕራፉ ርዕስ", "Add a chapter": "ምዕራፍ ያክሉ", "Remove media": "ሚዲያውን ያስወግዱ", "Submitted stories are published after an administrator approves them.": "የቀረቡ ታሪኮች አስተዳዳሪ ካጸደቃቸው በኋላ ይታተማሉ።", "JOIN THE CONVERSATION": "ውይይቱን ይቀላቀሉ", "Thoughts & perspectives": "ሀሳቦችና አመለካከቶች", "Write a comment": "አስተያየት ይጻፉ", "Be the first to add your perspective.": "አመለካከትዎን የመጀመሪያ ያጋሩ።", "CHRONICLE BOOKSHELF": "የChronicle መጽሐፍት መደርደሪያ", "History, chapter by chapter.": "ታሪክ፣ ምዕራፍ በምዕራፍ።", "＋ Write a history book": "＋ የታሪክ መጽሐፍ ይጻፉ", "Create your first book": "የመጀመሪያ መጽሐፍዎን ይፍጠሩ", "Open this book": "ይህን መጽሐፍ ይክፈቱ",
  "CHRONICLE MANAGEMENT": "የCHRONICLE አስተዳደር", "Steward the stories.": "ታሪኮቹን በኃላፊነት ይንከባከቡ።", "Support your community, review new history, and keep the archive thoughtful.": "ማህበረሰብዎን ይደግፉ፣ አዳዲስ ታሪኮችን ይገምግሙ፣ ማህደሩንም ጥራት ያለው ያድርጉ።", "AT A GLANCE": "በአጭሩ", "Community health": "የማህበረሰብ ሁኔታ", "Refresh": "አድስ", "POST FORMATS": "የልጥፍ ቅርጾች", "What members are creating": "አባላት እየፈጠሩ ያሉት", "No stories have been submitted yet.": "እስካሁን ምንም ታሪክ አልቀረበም።", "REVIEW QUEUE": "የግምገማ ወረፋ", "Keep the archive moving": "ማህደሩን እያደገ ያቆዩ", "Review pending posts": "በግምገማ ላይ ያሉ ልጥፎችን ይመልከቱ", "MEMBER DIRECTORY": "የአባላት ዝርዝር", "Manage accounts": "መለያዎችን ያስተዳድሩ", "Member": "አባል", "Joined": "የተቀላቀለበት ቀን", "Posts": "ልጥፎች", "Access": "መዳረሻ", "Account actions": "የመለያ እርምጃዎች", "No matching members found.": "የሚዛመድ አባል አልተገኘም።", "EDITORIAL REVIEW": "የአርታዒ ግምገማ", "Review community posts": "የማህበረሰብ ልጥፎችን ይገምግሙ", "Type": "ዓይነት", "Status": "ሁኔታ", "Note for the author": "ለደራሲው ማስታወሻ", "Preview post ↗": "ልጥፉን ቅድመ እይታ ↗", "Return for edits": "ለማስተካከያ መልስ", "Approve & publish": "አጽድቅና አትም", "No posts in this view": "በዚህ እይታ ምንም ልጥፍ የለም", "TEAM & CONTRIBUTORS": "ቡድንና አበርካቾች", "Create an assignment": "ተግባር ይፍጠሩ", "Assignment title": "የተግባሩ ርዕስ", "Assign to": "ለማን እንደሚመደብ", "Choose an active member": "ንቁ አባል ይምረጡ", "Due date": "የመጨረሻ ቀን", "WORK IN PROGRESS": "በሂደት ላይ ያለ ሥራ", "All assignments": "ሁሉም ተግባራት", "Created by": "የፈጠረው", "Assignee": "ተመዳቢ", "Delete": "ሰርዝ", "No assignments yet": "እስካሁን ተግባር የለም", "GEMINI-POWERED EDITORIAL SUPPORT": "በGEMINI የሚደገፍ የአርታዒ እገዛ", "AI writing studio": "የAI ጽሕፈት ስቱዲዮ", "Ready when you are.": "ሲዘጋጁ ዝግጁ ነው።", "Post type": "የልጥፍ ዓይነት", "What should the draft cover?": "ረቂቁ ምንን ይመልከት?", "Copy draft": "ረቂቁን ቅዳ", "Sign out": "ውጣ", "← Community": "← ማህበረሰብ"
});

Object.assign(translations, {
  "Your Chronicle": "የእርስዎ Chronicle", "Policies and help": "ፖሊሲዎችና እገዛ", "JPG, PNG, WebP, GIF, MP4, WebM, or MOV · up to 25 MB": "JPG፣ PNG፣ WebP፣ GIF፣ MP4፣ WebM ወይም MOV · እስከ 25 MB", "and": "እና", "Join free": "በነፃ ይቀላቀሉ", "Featured moment:": "የተመረጠ ክስተት፦"
});

Object.assign(translations, {
  "Choose a history story format": "የታሪክ ጽሑፍ ቅርጽ ይምረጡ", "Give this moment a memorable title": "ለዚህ ክስተት የሚታወስ ርዕስ ይስጡ", "e.g. Ancient, Medieval, Modern": "ለምሳሌ፦ ጥንታዊ፣ መካከለኛ ዘመን፣ ዘመናዊ", "e.g. 2560 BCE": "ለምሳሌ፦ 2560 ዓ.ዓ.", "Where did it happen?": "የት ተከሰተ?", "Share the people, turning points, and details that make this history matter.": "ይህን ታሪክ አስፈላጊ የሚያደርጉትን ሰዎች፣ ወሳኝ ክስተቶችና ዝርዝሮች ያጋሩ።", "e.g. 1453": "ለምሳሌ፦ 1453", "What happened?": "ምን ተከሰተ?", "Why does this moment matter?": "ይህ ክስተት ለምን አስፈላጊ ነው?", "More moments in history": "ተጨማሪ ታሪካዊ ክስተቶች", "Administration sections": "የአስተዳደር ክፍሎች", "Share a helpful suggestion if returning this post.": "ይህን ልጥፍ ሲመልሱ ጠቃሚ ምክር ያክሉ።", "Featured moment:": "የተመረጠ ክስተት፦", "Choose a featured history story": "ተመራጭ ታሪካዊ ጽሑፍ ይምረጡ", "Your email address": "የኢሜይል አድራሻዎ", "Chronicle home": "የChronicle መነሻ", "Main navigation": "ዋና አሰሳ", "Unread": "ያልተነበበ", "Your Chronicle activity": "የChronicle እንቅስቃሴዎ", "Dismiss message": "መልዕክቱን ዝጋ", "Dismiss notification": "ማሳወቂያውን ዝጋ", "Community stories": "የማህበረሰብ ታሪኮች", "Story actions": "የታሪክ እርምጃዎች", "Ada Lovelace": "አዳ ሎቭሌስ", "you@example.com": "ለምሳሌ you@example.com", "At least 8 characters": "ቢያንስ 8 ቁምፊዎች", "LALIBELA · ETHIOPIA": "ላሊበላ · ኢትዮጵያ", "You’re all caught up": "ሁሉንም አንብበዋል"
});

Object.assign(translations, {
  "Create your account": "መለያዎን ይፍጠሩ", "Join for free with your email and password, or use Google sign-in.": "በኢሜይልዎና በይለፍ ቃልዎ በነፃ ይመዝገቡ፣ ወይም በGoogle ይግቡ።", "Start your story": "ታሪክዎን ይጀምሩ", "Write a history story and add the details, images, or video that bring it to life.": "የታሪክ ጽሑፍ ይጻፉና ሕያው የሚያደርጉትን ዝርዝሮች፣ ምስሎች ወይም ቪዲዮ ያክሉ።", "Explore together": "አብረው ያስሱ", "Browse community stories, follow the timeline, and discover history from new perspectives.": "የማህበረሰቡን ታሪኮች ያስሱ፣ የጊዜ ሰሌዳውን ይከተሉ፣ ታሪክንም በአዲስ እይታ ያግኙ።", "Active historians": "ንቁ የታሪክ ተመራማሪዎች", "Events shared": "የተጋሩ ክስተቶች", "Years covered": "የተካተቱ ዓመታት", "Countries": "አገሮች", "Show": "አሳይ", "Scroll down": "ወደ ታች ይሸብልሉ", "Explore the timeline": "የጊዜ ሰሌዳውን ያስሱ",
  "Chapter I": "ምዕራፍ 1", "Chapter II": "ምዕራፍ 2", "Chapter III": "ምዕራፍ 3", "The Rise of Rome": "የሮም መነሳት", "From a small village on the Tiber to master of the Mediterranean, Rome's story begins with seven hills and one big idea.": "ከትንሽ መንደር በጤበር ወንዝ ዳር እስከ ሜዲትራኒያንን መቆጣጠር፣ የሮም ታሪክ በሰባት ኮረብታዎችና በአንድ ታላቅ ሀሳብ ይጀምራል።", "Bread & Circuses": "ዳቦና መዝናኛ", "The Colosseum rose in just eight years, and with it, the greatest show on earth. Watch the reconstruction video.": "ኮሎሲየሙ በስምንት ዓመታት ብቻ ተገነባ፤ ከእሱም ጋር በዓለም ላይ ታላቁ መዝናኛ ተነሳ። የመልሶ ግንባታ ቪዲዮውን ይመልከቱ።", "The Long Goodbye": "ረጅሙ መለያየት", "Empires don't fall in a day. Follow the slow unraveling across three centuries, event by event.": "ግዛቶች በአንድ ቀን አይወድቁም። በሶስት መቶ ዓመታት የተከሰተውን ቀስ በቀስ መፍረስ ክስተት በክስተት ይከታተሉ።", "History teacher": "የታሪክ መምህር", "Student": "ተማሪ", "Museum guide": "የሙዚየም መመሪያ", "My students now fight over who posts the next event. I've never seen them so hooked on history.": "ተማሪዎቼ ቀጣዩን ክስተት ማን እንደሚለጥፍ ይወዳደራሉ። ታሪክን እንዲህ ሲወዱ አይቼ አላውቅም።", "I opened it for 5 minutes and looked up an hour later. The timeline view is addictive.": "ለ5 ደቂቃ ብዬ ከፈትኩት፤ ከአንድ ሰዓት በኋላ አንስቼ ነበር። የጊዜ ሰሌዳው አስደሳች ነው።", "Book Mode feels like a living museum in my pocket. Beautiful and easy.": "የመጽሐፍ ሁነታ በኪሴ ያለ ሕያው ሙዚየም ይመስላል። ውብና ቀላል ነው።", "Today’s discovery": "የዛሬ ግኝት", "Share": "አጋራ", "prev": "ያለፈው", "next": "ቀጣይ"
});

Object.assign(translations, {
  "Lalibela, Ethiopia · Francesco Bandarin / UNESCO · CC BY-SA 3.0 IGO": "ላሊበላ፣ ኢትዮጵያ · ፍራንቸስኮ ባንዳሪን / UNESCO · CC BY-SA 3.0 IGO", "a password reset link is on its way. Check your inbox and spam folder.": "የይለፍ ቃል ማስተካከያ አገናኝ እየተላከ ነው። የገቢና የአይፈለጌ መልዕክት አቃፊዎን ይመልከቱ።", "↗ Share": "↗ አጋራ", "← Prev": "← ያለፈው", "Next →": "ቀጣይ →", "Chronicle. All rights reserved.": "Chronicle። መብቱ በሙሉ የተጠበቀ ነው።", "Restoring your Chronicle session…": "የChronicle መግቢያዎን በማስመለስ ላይ…", "← Back to your Chronicle": "← ወደ Chronicleዎ ተመለስ", "＋ Build a timeline": "＋ የጊዜ ሰሌዳ ይገንቡ", "Continue your journey through the rise and fall of Rome.": "የሮምን መነሳትና ውድቀት የሚከተለውን ጉዞዎን ይቀጥሉ።", "＋ Add another moment": "＋ ሌላ ክስተት ያክሉ", "Arrange your story into thoughtful, readable sections.": "ታሪክዎን በተደራጁና ተነባቢ ክፍሎች ያቅርቡ።", "＋ Add a chapter": "＋ ምዕራፍ ያክሉ", "· required": "· አስፈላጊ", "← Back to Discover": "← ወደ ያስሱ ተመለስ", "chapters": "ምዕራፎች", "← Back to the timeline": "← ወደ የጊዜ ሰሌዳው ተመለስ", "(optional)": "(አማራጭ)", "Add your Gemini API key to": "የGemini API ቁልፍዎን በዚህ ያክሉ፦", "then restart the backend. The key stays on the server and is never sent to the browser.": "ከዚያ backendን እንደገና ያስጀምሩ። ቁልፉ በሰርቨሩ ላይ ይቀመጣል፤ ወደ አሳሹ አይላክም።", "1 day": "1 ቀን", "Privacy": "ግላዊነት", "views ·": "እይታዎች ·", "likes ·": "ውደዳዎች ·", "comments": "አስተያየቶች"
});

Object.assign(translations, {
  "Written story": "የተጻፈ ታሪክ", "Shape the details into a thoughtful, readable article.": "ዝርዝሮቹን አስተዋይና ተነባቢ ጽሑፍ አድርገው ያቀርቡ።", "Visual timeline": "ምስላዊ የጊዜ ሰሌዳ", "Bring a sequence of important moments together.": "አስፈላጊ ክስተቶችን በቅደም ተከተል ያገናኙ።", "Image or video": "ምስል ወይም ቪዲዮ", "Tell the story through a powerful visual.": "ታሪኩን በሚያስደንቅ ምስል ያቅርቡ።", "Build a longer history from clear, readable chapters.": "ግልጽና ተነባቢ ምዕራፎችን በማገናኘት ረጅም ታሪክ ይገንቡ።", "Your article": "ጽሑፍዎ", "The story behind these moments": "ከእነዚህ ክስተቶች ጀርባ ያለው ታሪክ", "Context for your image or video": "ለምስልዎ ወይም ቪዲዮዎ ማብራሪያ", "Chapter text": "የምዕራፉ ጽሑፍ", "Tell this part of the story in an engaging, well-sourced way.": "ይህን የታሪኩን ክፍል አስደሳችና ምንጭ ያለው በሆነ መንገድ ይጻፉ።", "Your image or video": "ምስልዎ ወይም ቪዲዮዎ", "Add visual context": "ምስላዊ ማብራሪያ ያክሉ", "Add an image or video to give your written story visual context.": "ለተጻፈው ታሪክዎ ምስላዊ ማብራሪያ ለመስጠት ምስል ወይም ቪዲዮ ያክሉ።", "Choose a different file": "ሌላ ፋይል ይምረጡ", "Choose an image or video": "ምስል ወይም ቪዲዮ ይምረጡ", "Submitting…": "በማስገባት ላይ…", "Submit for review →": "ለግምገማ ያስገቡ →", "Make selected text bold": "የተመረጠውን ጽሑፍ ደማቅ አድርግ", "Quote selected text": "የተመረጠውን ጽሑፍ በጥቅስ አስገባ", "Bold": "ደማቅ", "Quote": "ጥቅስ", "Add a thoughtful comment…": "ገንቢ አስተያየት ያክሉ…", "Posting…": "በመለጠፍ ላይ…", "Post comment": "አስተያየት ለጥፍ", "This post contains an image or video.": "ይህ ልጥፍ ምስል ወይም ቪዲዮ ይዟል።", "Settle into a longer story. Follow the people, places, and turning points that connect the pages.": "ረጅም ታሪክን በምቾት ያንብቡ። ገጾቹን የሚያገናኙ ሰዎችን፣ ቦታዎችንና ወሳኝ ክስተቶችን ይከተሉ።", "Your next favorite history book is waiting to be written.": "ቀጣዩ ተወዳጅ የታሪክ መጽሐፍዎ እንዲጻፍ ይጠብቃል።", "Create a collection of chapters and help readers explore the past at their own pace.": "የምዕራፎች ስብስብ ይፍጠሩና አንባቢዎች ያለፈውን በራሳቸው ፍጥነት እንዲያስሱ ያግዙ።",
  "Overview": "አጠቃላይ እይታ", "Users": "ተጠቃሚዎች", "Post review": "የልጥፍ ግምገማ", "Assignments": "ተግባራት", "AI studio": "የAI ስቱዲዮ", "Total members": "ጠቅላላ አባላት", "Published & submitted": "የታተሙና የቀረቡ", "Awaiting review": "ግምገማ የሚጠብቁ", "Stories needing a decision": "ውሳኔ የሚጠብቁ ታሪኮች", "Across every post type": "በሁሉም የልጥፍ ዓይነቶች", "Team and contributor tasks": "የቡድንና የአበርካች ተግባራት", "The review queue is clear.": "የግምገማ ወረፋው ባዶ ነው።", "Find a member": "አባል ይፈልጉ", "All types": "ሁሉም ዓይነቶች", "All statuses": "ሁሉም ሁኔታዎች", "Active": "ንቁ", "Suspended": "የታገደ", "Suspend": "አግድ", "Activate": "አንቃ", "Remove admin": "አስተዳዳሪነትን አስወግድ", "Make admin": "አስተዳዳሪ አድርግ", "Showing up to 500 recent members. Your own access cannot be changed here.": "እስከ 500 የቅርብ ጊዜ አባላት ይታያሉ። የእርስዎን መዳረሻ እዚህ መቀየር አይቻልም።", "Try a different status or format filter.": "ሌላ የሁኔታ ወይም የቅርጽ ማጣሪያ ይሞክሩ።", "Research a timeline about...": "ስለ አንድ የጊዜ ሰሌዳ ጥናት ያድርጉ...", "Describe the expected outcome and useful historical context.": "የሚጠበቀውን ውጤትና ጠቃሚ ታሪካዊ አውድ ይግለጹ።", "Creating…": "በመፍጠር ላይ…", "Create assignment": "ተግባር ይፍጠሩ", "Gemini connected": "Gemini ተገናኝቷል", "API key needed": "የAPI ቁልፍ ያስፈልጋል", "For example: Draft an accessible overview of the Aksumite Empire's trade networks, with a short timeline and a reminder to verify key dates.": "ምሳሌ፦ ስለ አክሱም ግዛት የንግድ መረቦች ቀላል ማብራሪያ፣ አጭር የጊዜ ሰሌዳና ቁልፍ ቀኖችን ማረጋገጥ የሚያስታውስ ማስታወሻ ያዘጋጁ።", "Preparing draft…": "ረቂቅ በማዘጋጀት ላይ…", "Generate a draft ✦": "ረቂቅ ያዘጋጁ ✦", "AI draft copied to your clipboard.": "የAI ረቂቁ ወደ ቅንጥብ ሰሌዳዎ ተቀድቷል።", "Please wait…": "እባክዎ ይጠብቁ…", "Forgot password?": "የይለፍ ቃልዎን ረሱ?", "Save new password": "አዲስ የይለፍ ቃል ያስቀምጡ", "Email me a reset link": "የማስተካከያ አገናኝ በኢሜይል ላክልኝ", "Join free": "በነፃ ይቀላቀሉ", "Create account": "መለያ ይፍጠሩ", "Start exploring": "ማሰስ ይጀምሩ", "Save": "አስቀምጥ", "Cancel": "ሰርዝ", "Close": "ዝጋ", "Clear search": "ፍለጋውን አጽዳ", "Search community stories": "የማህበረሰቡን ታሪኮች ይፈልጉ", "Create a history book": "የታሪክ መጽሐፍ ይፍጠሩ", "All eras": "ሁሉም ዘመናት"
});

Object.assign(translations, {
  "THE PAST, PRESENT": "ያለፈውና አሁኑ", "Stories carved": "በድንጋይ የተቀረጹ ታሪኮች", "into stone.": "በድንጋይ ላይ።", "A monument built to outlast a lifetime": "ከሕይወት ዘመን በላይ እንዲቆይ የተገነባ ሐውልት", "Where the ancient world reached for the sky": "ጥንታዊው ዓለም ወደ ሰማይ የደረሰበት", "An empire leaves its mark on the world": "አንድ ግዛት በዓለም ላይ አሻራውን ያስቀምጣል", "Faith and artistry carved into living stone": "እምነትና ጥበብ በሕያው ድንጋይ ላይ ተቀርጸዋል",
  "Share any moment": "ማንኛውንም ክስተት ያጋሩ", "Post history events with text, photos, or video. Tell the story the way it deserves to be told.": "ታሪካዊ ክስተቶችን በጽሑፍ፣ በፎቶ ወይም በቪዲዮ ያጋሩ። ታሪኩን በሚገባው መንገድ ይንገሩ።", "Travel the timeline": "በጊዜ ሰሌዳው ይጓዙ", "Scroll through centuries. Jump to any year, era, or empire and watch events unfold in order.": "በዘመናት ውስጥ ይሸብልሉ። ወደ ማንኛውም ዓመት፣ ዘመን ወይም ግዛት ይዝለሉና ክስተቶች በቅደም ተከተል ሲከናወኑ ይመልከቱ።", "Read like a book": "እንደ መጽሐፍ ያንብቡ", "Switch to Book Mode: turn pages, follow chapters, and enjoy history with images and video inline.": "ወደ መጽሐፍ ሁነታ ይቀይሩ፦ ገጾችን ይገልጡ፣ ምዕራፎችን ይከተሉ፣ ታሪክንም በምስልና ቪዲዮ ያንብቡ።", "Daily streaks": "የዕለት ተከታታይ ቀናት", "Learn something new every day. Build streaks, earn badges, and climb the historian leaderboard.": "በየቀኑ አዲስ ነገር ይማሩ። ተከታታይ ቀናትን ያሳድጉ፣ ሽልማቶችን ያግኙ፣ በታሪክ ተመራማሪዎች ደረጃም ይውጡ።", "Debate & discover": "ይወያዩና ያግኙ", "Comment, react, and join communities around eras, nations, wars, and civilizations.": "በዘመናት፣ በአገሮች፣ በጦርነቶችና በሥልጣኔዎች ዙሪያ አስተያየት ይስጡ፣ ምላሽ ይስጡና ማህበረሰቦችን ይቀላቀሉ።", "Verified sources": "የተረጋገጡ ምንጮች", "Attach sources to every post. Community fact-checks keep the history honest.": "ለእያንዳንዱ ልጥፍ ምንጮችን ያያይዙ። የማህበረሰቡ እውነታ ማረጋገጫ ታሪኩን ትክክለኛ ያደርገዋል።",
  "The past, made social.": "ያለፈው ዘመን በማህበራዊ መድረክ።", "Jump into the past": "ወደ ያለፈው ዘመን ይግቡ", "Share your first story": "የመጀመሪያ ታሪክዎን ያጋሩ", "Explore the timeline": "የጊዜ ሰሌዳውን ያስሱ", "Explore the past": "ያለፈውን ያስሱ", "Share a moment": "ክስተት ያጋሩ", "Read a story": "ታሪክ ያንብቡ", "Start exploring — it's free": "ማሰስ ይጀምሩ — በነፃ", "See what Chronicle is about": "Chronicle ምን እንደሆነ ይመልከቱ",
  "Check your email": "ኢሜይልዎን ይመልከቱ", "If an account exists for": "መለያ ካለ ለ", "a password reset link is on its way. Check your inbox and spam folder.": "የይለፍ ቃል ማስተካከያ አገናኝ እየተላከ ነው። የገቢ መልዕክትና የአይፈለጌ መልዕክት አቃፊዎን ይመልከቱ።", "Already have an account?": "መለያ አለዎት?", "New to Chronicle?": "Chronicleን አዲስ ነዎት?", "Create an account": "መለያ ይፍጠሩ", "Log in": "ግባ", "← Back to log in": "← ወደ መግቢያ ተመለስ", "By continuing, you agree to Chronicle’s": "በመቀጠል የChronicleን ውሎች ተቀብለዋል።", "Terms": "ውሎች", "Privacy Policy": "የግላዊነት ፖሊሲ",
  "No stories match “": "“", "”. Try another name, era, or topic.": "” የሚዛመድ ታሪክ የለም። ሌላ ስም፣ ዘመን ወይም ርዕስ ይሞክሩ።", "found": "ተገኝተዋል", "stories": "ታሪኮች", "story": "ታሪክ", "views": "እይታዎች", "likes": "ውደዳዎች", "comments": "አስተያየቶች", "Like": "ውደድ", "Likes": "ውደዳዎች", "Comment": "አስተያየት", "Comments": "አስተያየቶች", "Share": "አጋራ", "View full timeline →": "ሙሉ የጊዜ ሰሌዳውን ይመልከቱ →", "Stories worth your time": "ጊዜዎን የሚገቡ ታሪኮች", "For you": "ለእርስዎ", "Open story ↗": "ታሪክ ይክፈቱ ↗", "Read": "ያንብቡ", "Open this book": "ይህን መጽሐፍ ይክፈቱ",
  "Select text first, or add formatting where you are typing. Styling appears after publishing.": "መጀመሪያ ጽሑፍ ይምረጡ፤ ወይም በሚጽፉበት ቦታ ቅርጸት ያክሉ። ቅጥ ከህትመት በኋላ ይታያል።", "Tell a story from history.": "ከታሪክ የተወሰደ ታሪክ ይንገሩ።", "Write history, chapter by chapter.": "ታሪክን ምዕራፍ በምዕራፍ ይጻፉ።", "Opening this chapter…": "ይህ ምዕራፍ በመክፈት ላይ…", "Back to Discover": "ወደ ያስሱ ተመለስ", "CHAPTER": "ምዕራፍ", "Back to the timeline": "ወደ የጊዜ ሰሌዳው ተመለስ", "This moment could not be found.": "ይህ ክስተት አልተገኘም።", "Choose another moment from the Chronicle timeline.": "ከChronicle የጊዜ ሰሌዳ ሌላ ክስተት ይምረጡ።", "THE STORY BEHIND THE MOMENT": "ከክስተቱ ጀርባ ያለው ታሪክ", "Tell this history your way": "ይህን ታሪክ በእርስዎ መንገድ ይንገሩ", "PREVIOUS MOMENT": "ያለፈው ክስተት", "NEXT MOMENT": "ቀጣዩ ክስተት",
  "ADMIN WORKSPACE": "የአስተዳዳሪ የሥራ ቦታ", "Good to see you,": "እንደገና ስላየንዎት ደስ ብሎናል፣", "CHRONICLE MANAGEMENT": "የCHRONICLE አስተዳደር", "Steward the stories.": "ታሪኮቹን በኃላፊነት ይንከባከቡ።", "Support your community, review new history, and keep the archive thoughtful.": "ማህበረሰብዎን ይደግፉ፣ አዳዲስ ታሪኮችን ይገምግሙ፣ ማህደሩንም ጥራት ያለው ያድርጉ።", "✦ Administrator": "✦ አስተዳዳሪ", "← Community": "← ማህበረሰብ", "Post formats": "የልጥፍ ቅርጾች", "What members are creating": "አባላት እየፈጠሩ ያሉት", "No stories have been submitted yet.": "እስካሁን ምንም ታሪክ አልቀረበም።", "REVIEW QUEUE": "የግምገማ ወረፋ", "Keep the archive moving": "ማህደሩን እያደገ ያቆዩ", "Review pending posts": "በግምገማ ላይ ያሉ ልጥፎችን ይመልከቱ", "MEMBER DIRECTORY": "የአባላት ዝርዝር", "Manage accounts": "መለያዎችን ያስተዳድሩ", "Activate or suspend access and assign administrator privileges.": "መዳረሻን ያንቁ ወይም ያግዱ፣ የአስተዳዳሪ ሥልጣንም ይመድቡ።", "Account actions": "የመለያ እርምጃዎች", "No matching members found.": "የሚዛመድ አባል አልተገኘም።", "EDITORIAL REVIEW": "የአርታዒ ግምገማ", "Review community posts": "የማህበረሰብ ልጥፎችን ይገምግሙ", "Explore posts by format, approve accurate work, or return it with a constructive note.": "ልጥፎችን በቅርጽ ያስሱ፣ ትክክለኛውን ያጽድቁ ወይም ገንቢ ማስታወሻ አያይዘው ይመልሱ።", "Previous editor note:": "ያለፈው የአርታዒ ማስታወሻ፦", "Note for the author": "ለደራሲው ማስታወሻ", "Return for edits": "ለማስተካከያ መልስ", "Approve & publish": "አጽድቅና አትም", "No posts in this view": "በዚህ እይታ ምንም ልጥፍ የለም", "TEAM & CONTRIBUTORS": "ቡድንና አበርካቾች", "Create an assignment": "ተግባር ይፍጠሩ", "Give a member a clear, trackable contribution to Chronicle.": "ለአባል ግልጽና ሊከታተል የሚችል የChronicle አስተዋጽኦ ይመድቡ።", "Choose an active member": "ንቁ አባል ይምረጡ", "Brief and context": "አጭር ማብራሪያና አውድ", "Activate a member account before assigning a task.": "ተግባር ከመመደብዎ በፊት የአባሉን መለያ ያንቁ።", "WORK IN PROGRESS": "በሂደት ላይ ያለ ሥራ", "All assignments": "ሁሉም ተግባራት", "No assignments yet": "እስካሁን ተግባር የለም", "Create an assignment above to get the work started.": "ሥራውን ለመጀመር ከላይ ተግባር ይፍጠሩ።", "GEMINI-POWERED EDITORIAL SUPPORT": "በGEMINI የሚደገፍ የአርታዒ እገዛ", "AI writing studio": "የAI ጽሕፈት ስቱዲዮ", "Generate a first draft for editorial work. An administrator must check facts and sources before publication.": "ለአርታዒ ሥራ የመጀመሪያ ረቂቅ ያዘጋጁ። ከህትመት በፊት አስተዳዳሪ እውነታዎችንና ምንጮችን ማረጋገጥ አለበት።", "Ready when you are.": "ሲዘጋጁ ዝግጁ ነው።", "Copy draft": "ረቂቁን ቅዳ", "EDITORIAL DRAFT · VERIFY BEFORE PUBLISHING": "የአርታዒ ረቂቅ · ከህትመት በፊት ያረጋግጡ"
});

Object.assign(translations, {
  "This story needs revision.": "ይህ ታሪክ ማስተካከያ ይፈልጋል።", "This story is awaiting review.": "ይህ ታሪክ ግምገማ እየጠበቀ ነው።", "Review the administrator's feedback and revise your submission.": "የአስተዳዳሪውን አስተያየት ይመልከቱና ያስገቡትን ያስተካክሉ።", "Only you and Chronicle administrators can see it until it is approved.": "እስኪጸድቅ ድረስ እርስዎና የChronicle አስተዳዳሪዎች ብቻ ማየት ይችላሉ።", "Published": "ታትሟል", "Revision requested": "ማስተካከያ ተጠይቋል", "Under review": "በግምገማ ላይ", "All eras": "ሁሉም ዘመናት", "Ancient": "ጥንታዊ", "Medieval": "መካከለኛ ዘመን", "Modern": "ዘመናዊ", "Today": "ዛሬ", "Yesterday": "ትናንት"
});

Object.assign(translations, {
  "all": "ሁሉም", "blog": "ጽሑፍ", "timeline": "የጊዜ ሰሌዳ", "media": "ሚዲያ", "book": "መጽሐፍ", "pending": "በመጠባበቅ ላይ", "approved": "ጸድቋል", "rejected": "ተመልሷል", "in progress": "በሂደት ላይ", "not started": "አልተጀመረም", "completed": "ተጠናቋል", "active": "ንቁ", "suspended": "የታገደ", "Overview": "አጠቃላይ እይታ", "Users": "ተጠቃሚዎች", "Post review": "የልጥፍ ግምገማ", "Assignments": "ተግባራት", "AI studio": "የAI ስቱዲዮ", "Total members": "ጠቅላላ አባላት", "Published & submitted": "የታተሙና የቀረቡ", "Across every post type": "በሁሉም የልጥፍ ዓይነቶች", "Stories needing a decision": "ውሳኔ የሚጠብቁ ታሪኮች", "The review queue is clear.": "የግምገማ ወረፋው ባዶ ነው።", "Find a member": "አባል ይፈልጉ", "All types": "ሁሉም ዓይነቶች", "All statuses": "ሁሉም ሁኔታዎች", "Member": "አባል", "Joined": "የተቀላቀለበት ቀን", "Posts": "ልጥፎች", "Access": "መዳረሻ", "Suspend": "አግድ", "Activate": "አንቃ", "Remove admin": "አስተዳዳሪነትን አስወግድ", "Make admin": "አስተዳዳሪ አድርግ", "Showing up to 500 recent members. Your own access cannot be changed here.": "እስከ 500 የቅርብ ጊዜ አባላት ይታያሉ። የእርስዎን መዳረሻ እዚህ መቀየር አይቻልም።"
});

Object.assign(translations, {
  "stories": "ታሪኮች", "found": "ተገኝተዋል", "new": "አዲስ", "unread": "ያልተነበበ", "active accounts": "ንቁ መለያዎች", "open": "ክፍት", "1 day": "1 ቀን", "days": "ቀናት", "created by": "የፈጠረው", "assigned by": "የመደበው", "due": "የመጨረሻ ቀን", "waiting for an administrator review.": "የአስተዳዳሪ ግምገማ እየጠበቀ ነው።", "No stories match": "የሚዛመድ ታሪክ የለም", "Try another name, era, or topic.": "ሌላ ስም፣ ዘመን ወይም ርዕስ ይሞክሩ።", "You're all caught up": "ሁሉንም አንብበዋል", "You’re all caught up": "ሁሉንም አንብበዋል", "No stories match “": "“", "”. Try another name, era, or topic.": "” የሚዛመድ ታሪክ የለም። ሌላ ስም፣ ዘመን ወይም ርዕስ ይሞክሩ።"
});

Object.assign(translations, {
  "Chronicle | Where History Lives": "Chronicle | ታሪክ የሚኖርበት", "Share history events with text, images and video. Explore the past on a timeline or read it like a book.": "ታሪካዊ ክስተቶችን በጽሑፍ፣ በምስልና በቪዲዮ ያጋሩ። ያለፈውን በጊዜ ሰሌዳ ያስሱ ወይም እንደ መጽሐፍ ያንብቡ።", "Explore the stories that shaped our world.": "ዓለማችንን የቀረጹ ታሪኮችን ያስሱ။", "A moment in history": "ታሪካዊ ክስተት", "By ": "በ ", "Due ": "የመጨረሻ ቀን ", "new": "አዲስ", "2h": "ከ2 ሰዓት በፊት", "5h": "ከ5 ሰዓት በፊት", "1d": "ከ1 ቀን በፊት"
});

Object.assign(translations, {
  "The account service is temporarily unavailable. Please try again in a moment.": "የመለያ አገልግሎቱ ለጊዜው አይገኝም። እባክዎ ከጥቂት ጊዜ በኋላ ይሞክሩ።",
  "We couldn't complete your request right now. Please try again in a moment.": "ጥያቄዎን አሁን ማጠናቀቅ አልቻልንም። እባክዎ ከጥቂት ጊዜ በኋላ ይሞክሩ።",
  "The account service returned an unexpected response (HTTP ": "የመለያ አገልግሎቱ ያልተጠበቀ ምላሽ ሰጥቷል (HTTP ",
  "Chronicle cannot reach its database. Check DATABASE_URL and confirm that the configured database is available.": "Chronicle ከዳታቤዙ ጋር መገናኘት አልቻለም። DATABASE_URLን እና ዳታቤዙ መገኘቱን ያረጋግጡ።"
});

export function useLanguage() {
  const [language, setLanguage] = useState(() => localStorage.getItem(KEY) || "en");
  useEffect(() => {
    const update = () => setLanguage(localStorage.getItem(KEY) || "en");
    document.documentElement.lang = language === "am" ? "am" : "en";
    window.addEventListener("chronicle-language-change", update);
    return () => window.removeEventListener("chronicle-language-change", update);
  }, [language]);
  const set = (next) => {
    localStorage.setItem(KEY, next);
    document.documentElement.lang = next === "am" ? "am" : "en";
    window.dispatchEvent(new Event("chronicle-language-change"));
  };
  return { language, setLanguage: set, t: (value) => language === "am" ? (translations[value] || value) : value };
}

const textState = new WeakMap();
const attributeState = new WeakMap();
const userContent = ".member-post-title, .member-post-copy, .member-post header, .member-post-timeline p, .member-notification-copy, .member-live-notice strong, .member-live-notice small, .nav-profile-name, .member-profile-name, .user-generated-name, .published-story-heading .eyebrow, .published-story-heading h1, .published-story-heading p, .published-story-body, .published-timeline-event h2, .published-timeline-event p, .published-book-chapter h2, .published-comment-list article p, .published-comment-list article strong, .book-mode-preview, .shared-timeline .member-tag, .shared-timeline h2, .shared-timeline > p, .shared-timeline-event h3, .shared-timeline-event p, .admin-story-meta > span:nth-of-type(3), .admin-story-content, .admin-story-author, .admin-moderation-note, .admin-assignment-copy h3, .admin-assignment-copy p, .member-task-card h3, .member-task-card p, .admin-table td strong, .admin-table td small";
const translationEntries = Object.entries(translations).sort(([left], [right]) => right.length - left.length);

function localize(value, language) {
  if (language !== "am") return value;
  const trimmed = value.trim();
  const exact = translations[trimmed];
  if (exact) return value.replace(trimmed, exact);
  return translationEntries.reduce((result, [english, amharic]) => english.length > 3 ? result.replaceAll(english, amharic) : result, value);
}

function translateNode(node, language) {
  const parent = node.parentElement;
  if (!parent || parent.closest(`script,style,noscript,textarea,input,[contenteditable='true'],${userContent}`)) return;
  const current = node.nodeValue;
  const state = textState.get(node) || { original: current, translated: null };
  if (state.translated !== null && current !== state.translated) state.original = current;
  const original = state.original;
  const leading = original.match(/^\s*/)?.[0] || "";
  const trailing = original.match(/\s*$/)?.[0] || "";
  const phrase = original.trim();
  const next = localize(phrase, language);
  if (next && next !== phrase) {
    const value = `${leading}${next}${trailing}`;
    if (node.nodeValue !== value) node.nodeValue = value;
    state.translated = value;
  } else {
    if (node.nodeValue !== original) node.nodeValue = original;
    state.translated = original;
  }
  textState.set(node, state);
}

function translateAttributes(element, language) {
  if (element.closest?.(userContent)) return;
  let states = attributeState.get(element);
  if (!states) { states = new Map(); attributeState.set(element, states); }
  for (const name of ["placeholder", "title", "aria-label"]) {
    if (!element.hasAttribute(name)) continue;
    const current = element.getAttribute(name);
    const state = states.get(name) || { original: current, translated: null };
    if (state.translated !== null && current !== state.translated) state.original = current;
    const original = state.original;
    const phrase = original.trim();
    const localized = localize(original, language);
    const value = localized;
    if (value !== current) element.setAttribute(name, value);
    state.translated = value;
    states.set(name, state);
  }
}

function translateDocument(language) {
  const root = document.body;
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) translateNode(node, language);
  root.querySelectorAll("*").forEach((element) => translateAttributes(element, language));
}

export function useSiteLocalization() {
  const { language } = useLanguage();
  useEffect(() => {
    document.documentElement.lang = language === "am" ? "am" : "en";
    const resourceRoute = ["/faq", "/terms", "/privacy", "/community-policy"].includes(window.location.pathname);
    if (!resourceRoute) document.title = language === "am" ? "Chronicle | ታሪክ የሚኖርበት" : "Chronicle | Where History Lives";
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = language === "am" ? translations["Share history events with text, images and video. Explore the past on a timeline or read it like a book."] : "Share history events with text, images and video. Explore the past on a timeline or read it like a book.";
    translateDocument(language);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") translateNode(mutation.target, language);
        mutation.addedNodes?.forEach((added) => {
          if (added.nodeType === Node.TEXT_NODE) translateNode(added, language);
          else if (added.nodeType === Node.ELEMENT_NODE) {
            if (added.matches?.(userContent) || added.closest?.(userContent)) return;
            const walker = document.createTreeWalker(added, NodeFilter.SHOW_TEXT);
            let child;
            while ((child = walker.nextNode())) translateNode(child, language);
            translateAttributes(added, language);
            added.querySelectorAll?.("*").forEach((element) => translateAttributes(element, language));
          }
        });
        if (mutation.type === "attributes") translateAttributes(mutation.target, language);
      }
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["placeholder", "title", "aria-label"] });
    return () => observer.disconnect();
  }, [language]);
}

export function LanguagePicker() {
  const { language, setLanguage } = useLanguage();
  return <div className="language-picker" role="group" aria-label={language === "am" ? "ቋንቋ" : "Language"}><button type="button" aria-label="English" aria-pressed={language === "en"} className={language === "en" ? "is-active" : ""} onClick={() => setLanguage("en")}>EN</button><button type="button" aria-label="Amharic" aria-pressed={language === "am"} className={language === "am" ? "is-active" : ""} onClick={() => setLanguage("am")}>AM</button></div>;
}
