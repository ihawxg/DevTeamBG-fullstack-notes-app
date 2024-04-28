import moment from "moment";
import React from "react";
import { MdOutlinePushPin } from "react-icons/md";
import { MdCreate, MdDelete } from "react-icons/md";
import './notescard.scss'

const NoteCard = ({ title, date, content, tags, isPinned, onEdit, onDelete, onPinNote }) => {
  return (
    <div className="border rounded p-4 bg-white hover:shadow-xl transition-all ease-in-out relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:items-center h-full">
        <div className="lg:col-span-2">
          <h6 className="text-sm font-medium">{title}</h6>
          <span className="text-xs text-slate-500">{date ? moment(date).format('Do MMM YYYY') : '-'}</span>
          <p className="text-xs text-slate-600 mt-2" style={{ maxWidth: "100%", wordWrap: "break-word" }}>
            {content}
          </p>
          <p className="text-xs text-slate-500" style={{ maxWidth: "100%", wordWrap: "break-word" }}>{tags.map((item) => `#${item} `)}</p>
        </div>

        <div className="lg:col-start-3 lg:flex lg:baseline test">
          <MdOutlinePushPin className={`icon-btn ${isPinned ? 'text-primary' : 'text-slate-300'} lg:ml-2`} onClick={onPinNote} />

          <div className="test2">
            <MdCreate className="icon-btn hover:text-green-600" onClick={onEdit} />
            <MdDelete className="icon-btn hover:text-red-500" onClick={onDelete} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;

{/* <div className="text-xs text-slate-500">
            <p style={{ maxWidth: "100%", wordWrap: "break-word" }}>{tags.map((item) => `#${item} `)}</p>
          </div> */}


// import moment from "moment";
// import React from "react";
// import { MdOutlinePushPin } from "react-icons/md";
// import { MdCreate, MdDelete } from "react-icons/md";

// const NoteCard = ({ title, date, content, tags, isPinned, onEdit, onDelete, onPinNote }) => {
//   return (
//     <div className="border rounded p-4 bg-white hover:shadow-xl transition-all ease-in-out">
//       <div className="flex items-center justify-between">
//         <div>
//           <h6 className="text-sm font-medium">{title}</h6>
//           <span className="text-xs text-slate-500">{date ? moment(date).format('Do MMM YYYY') : '-'}</span>
//         </div>

//         <MdOutlinePushPin className={`icon-btn ${isPinned ? 'text-primary' : 'text-slate-300'}`} onClick={onPinNote} />
//       </div>

//       <p className="text-xs text-slate-600 mt-2">
//         {content?.slice(0, 60)}
//       </p>

//       <div className="flex items-center justify-between mt-2">
//         <div className="text-xs text-slate-500">{tags.map((item) => `#${item} `)}</div>

//         <div className="flex items-center gap-2">
//           <MdCreate className="icon-btn hover:text-green-600" onClick={onEdit} />
//           <MdDelete className="icon-btn hover:text-red-500" onClick={onDelete} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NoteCard;
