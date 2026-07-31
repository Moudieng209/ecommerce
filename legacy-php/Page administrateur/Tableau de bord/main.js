$(document).ready(()=>{
  
    $('#open-sidebar').click(()=>{
       
        // AJOUTER class active SUR LE #sidebar
        $('#sidebar').addClass('active');
        
        // AFFICHER sidebar overlay
        $('#sidebar-overlay').removeClass('d-none');
      
     });
    
    
     $('#sidebar-overlay').click(function(){
       
        // AJOUTER class active SUR LE #sidebar
        $('#sidebar').removeClass('active');
        
        // AFFICHER sidebar overlay
        $(this).addClass('d-none');
      
     });
    
  });