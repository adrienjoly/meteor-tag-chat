isValidTag = function(tag){
  return typeof tag == "string" && /^[a-zA-Z0-9\-\_]+$/.test(tag);
};
