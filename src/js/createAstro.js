function createAstro()
{
    controls.enabled = true;
    let size = parseInt($("#size").val());
    let rings=$("#rings option:selected").val();
    let spin = $("#spin").val();
    let orbit=$("#orbit").val();
    let moons=$("#moons").val();
    let distance=parseInt($("#distance").val());
    let texure=$("#texture").val();
    let name=$("#name").val();
    console.log(distance)





    astros[distance]= new Astro(name,size, spin, orbit,(distance*300+150), "src/textures/"+texure+".jpg", rings);
    sun.addOrbiter(astros[distance]);
    //astros[astroCount]=astro;
    planets.push(astros[distance]);
    

    for(i=0;moons>i;i++)
    {
        moon = new Astro("x",size/10,30, 100,(parseInt(size)+10), "src/textures/moon.jpg",false,true);
        astros[distance].addMoon(moon);  

    }
    
    document.getElementById('size').value = '';
    document.getElementById('spin').value = '';
    document.getElementById('orbit').value = '';
    document.getElementById('moons').value = '';
    document.getElementById('distance').value = '';
    document.getElementById('name').value = '';
      
}

function checkDistance()
{
    let size = $("#distance").val()*300+150;
    let flag = true;
    astros.forEach(function(element) {
        console.log("elemtno",element.getDistance())
        console.log("size",size)
        if(element.getDistance()==size)
        {
            flag=false
        }
    });
    if(!flag)
    {
        $("#create").attr("disabled", true);
        $("#colision").text("This astro is in the orbit of another astro");
        $("#colision").css("color", "red");
    }
    else
    {
        $("#create").attr("disabled", false);
        $("#colision").text("All good");
        $("#colision").css("color", "green");
    }

}

function disableit()
{
    controls.enabled = false;
}

function lock()
{
    if(controls.enabled)
    {
        controls.enabled= false;
    }
    else
    {
        controls.enabled= true;
    }
  camera.position.set(0, 7500, 0);
  
  camera.lookAt(0, 0, 0);

}


function onDocumentMouseDown(event)
{
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // find intersections
    raycaster.setFromCamera( mouse, camera );

    
    //console.log(planets);
    var intersects = raycaster.intersectObjects( planets,true );
    //1console.log(raycaster.intersectObjects( planets,true ));

    if ( intersects.length > 0 ) 
    {
        CLICKED = intersects[3].object.parent;
       // console.log(intersects[3].object.parent);
        $("#del").text("delete: "+intersects[3].object.parent.name);

        /*if(!animator.running)
        {
            for(var i = 0; i<= animator.interps.length -1; i++)
            {
                animator.interps[i].target = CLICKED.rotation;
            }
            playAnimations();
        }*/
    }
}

function deleteSelected()
{2
    console.log(astros[CLICKED.distance]);
    scene.remove(astros[CLICKED.distance]);

}