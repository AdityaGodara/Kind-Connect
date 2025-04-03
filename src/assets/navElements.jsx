import { 
  faHouse, 
  faCircleExclamation, 
  faClockRotateLeft,  
  faCalendarDay, 
  faEarthAsia
} from '@fortawesome/free-solid-svg-icons';

const navItems = [
    {
      icon: faHouse,
      title: "Home",
      path: "/dashboard",
    },
    {
      icon: faCalendarDay,
      title: "Events",
      path: "/events"
    },
    // {
    //   icon: faCircleExclamation,
    //   title: "Alerts",
    //   path: "/alerts"
    // },
    
    {
      icon: faEarthAsia,
      title: "Community",
      path: "/community"
    },
    // {
    //   icon: faClockRotateLeft,
    //   title: "History",
    //   path: "/history"
    // },
  ];

  export default navItems;