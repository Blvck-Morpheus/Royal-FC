import logoImage from "@assets/Royal FC Logo.png";

const Logo = () => {
  return (
    <div className="h-12 w-12 overflow-hidden">
      <img 
        src={logoImage} 
        alt="Royal FC Logo" 
        className="h-full w-full object-contain"
      />
    </div>
  );
};

export default Logo;
