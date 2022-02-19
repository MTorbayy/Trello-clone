const itemsContainer = document.querySelectorAll('.items-container') as NodeListOf<HTMLDivElement>

let actualContainer: HTMLDivElement,
    actualBtn: HTMLButtonElement,
    actualUl: HTMLUListElement,
    actualForm: HTMLFormElement,
    actualTextInput: HTMLInputElement,
    actualValidation: HTMLSpanElement


// Container général de toutes les fonctions addEventListener

function addContainerListeners(currentContainer: HTMLDivElement) {

    //Récupération des éléments (boutons, formulaire) du container :
    const currentContainerDeletionBtn = currentContainer.querySelector('.delete-container-btn') as HTMLButtonElement;
    const currentAddItemBtn = currentContainer.querySelector('.add-item-btn') as HTMLButtonElement
    const currentCloseFormBtn = currentContainer.querySelector('.close-form-btn') as HTMLButtonElement
    const currentForm = currentContainer.querySelector('form') as HTMLFormElement

    //Attribution de fonctions aux boutons :
    deleteBtnListeners(currentContainerDeletionBtn)
    addItemBtnListeners(currentAddItemBtn)
    closingFormBtnListeners(currentCloseFormBtn)
    addFormSubmitListeners(currentForm)
    addDDListeners(currentContainer)

}

//Appel de chaque container avec la fonction précédente

itemsContainer.forEach((container: HTMLDivElement) => {
    addContainerListeners(container)
})

//Fonction permettant de mettre tous les éléments du container courant dans des variables pour pouvoir les utiliser

function setContainerItem(btn: HTMLButtonElement) {
    actualBtn = btn
    actualContainer = btn.parentElement as HTMLDivElement
    actualUl = actualContainer.querySelector('ul') as HTMLUListElement
    actualForm = actualContainer.querySelector('form') as HTMLFormElement
    actualTextInput = actualContainer.querySelector('input') as HTMLInputElement
    actualValidation = actualContainer.querySelector('.validation-msg') as HTMLSpanElement
}

//Fonctions EventListeners

function deleteBtnListeners(btn: HTMLButtonElement) {
    btn.addEventListener('click', handleContainerDeletion)
}
function addItemBtnListeners(btn: HTMLButtonElement) {
    btn.addEventListener('click', handleAddItem)
}
function closingFormBtnListeners(btn: HTMLButtonElement) {
    btn.addEventListener('click', () => toggleForm(actualBtn, actualForm, false))
}

function addFormSubmitListeners(form: HTMLFormElement) {
    form.addEventListener('submit', createNewItem)
}

function addDDListeners(element: HTMLElement) {
    element.addEventListener('dragstart', handleDragStart)
    element.addEventListener('dragover', handleDragOver)
    element.addEventListener('drop', handleDrop)
    element.addEventListener('dragend', handleDragEnd)

}

//Fonctions déclenchées par les évènements

function handleContainerDeletion(e: MouseEvent){
    const btn = e.target as HTMLButtonElement;
    const btnsArray = [...document.querySelectorAll('.delete-container-btn')] as HTMLButtonElement[];
    const containers = [...document.querySelectorAll('.items-container')] as HTMLDivElement[];
    containers[btnsArray.indexOf(btn)].remove()
}

function handleAddItem(e: MouseEvent) {
    const btn = e.target as HTMLButtonElement
    if(actualContainer) {
        toggleForm(actualBtn, actualForm, false)
    }
    setContainerItem(btn)
    toggleForm(actualBtn, actualForm, true)
}

function toggleForm(btn: HTMLButtonElement, form: HTMLFormElement, action: boolean) {
    if(!action) {
        form.style.display = "none"
        btn.style.display = "block"
    } else if (action) {
        form.style.display = "block"
        btn.style.display = "none"
    }
}

function createNewItem(e: Event) {
    e.preventDefault()
    //Validation :
    if(actualTextInput.value.length === 0) {
        actualValidation.textContent = "Must be at least 1 character long"
        return
    } else {
        actualValidation.textContent = ""
    }

    //Création Item (li)
    const itemContent = actualTextInput.value
    const li = `<li class="item" draggable="true">
    <p>${itemContent}</p>
    <button>X</button>
    </li>`
    actualUl.insertAdjacentHTML('beforeend', li)

    //Supression item
    const item = actualUl.lastElementChild as HTMLLIElement
    const liBtn = item.querySelector('button') as HTMLButtonElement
    handleItemDeletion(liBtn)
    addDDListeners(item)

    //Vider l'input
    actualTextInput.value = ""
}

function handleItemDeletion(btn: HTMLButtonElement) {
    btn.addEventListener('click', () => {
        const elToRemove = btn.parentElement as HTMLLIElement
        elToRemove.remove()
    })
}

//Drag and Drop

let dragSrcEl: HTMLElement

function handleDragStart(this: HTMLElement, e: DragEvent) {
    e.stopPropagation()

    //Ici this correspond à l'élément sélectionné au départ

    if(actualContainer) {
        toggleForm(actualBtn, actualForm, false)
    }
    //On récupère l'élément que l'on vient de prendre dans une variable :
    dragSrcEl = this

    //dataTransfer contient les données correspondant à l'élément glissé, et accepte la méthode setData qui permet de copier l'innerHTML (dans cet exemple) de l'élément soulevé :
    e.dataTransfer?.setData('text/html', this.innerHTML)
}

function handleDragOver(e: DragEvent) {
    e.preventDefault()
    //Obligatoire pour faire fonctionner le D&D
}


//handleDrop gère l'élément de réception :

function handleDrop(this: HTMLElement, e: DragEvent) {
    e.stopPropagation()

    //Ici this correspond à l'élément de réception :
    const receptionEl = this

    if(dragSrcEl.nodeName === "LI" && receptionEl.classList.contains("items-container")) {
        //Si l'élément draggué est une liste et l'élément de réception est un items-container
        (receptionEl.querySelector('ul') as HTMLUListElement).appendChild(dragSrcEl)

        //On rajoute les fonctions qu'on veut pouvoir utiliser sur ce nouvel élément, dont la fonction de D&D car elle a été supprimée au passage :
        addDDListeners(dragSrcEl)
        handleItemDeletion(dragSrcEl.querySelector("button") as HTMLButtonElement)

    } 
    
    if(dragSrcEl !== this && this.classList[0] === dragSrcEl.classList[0]) {
        //Dans le cas où je veux échanger un item avec un autre item ou une li avec une autre li : ils doivent être différents, mais avoir la même classe
        
        //On remplace l'élément sélectionné par l'élément visé :
        dragSrcEl.innerHTML = this.innerHTML

        //On remplace l'élément visé par l'élément sélectionné, avec la méthode getData qui récupère ce qui a été défini avec setData précédemment :
        this.innerHTML = e.dataTransfer?.getData('text/html') as string

        //On rajoute les fonctions qu'on veut pouvoir utiliser sur ce nouvel élément, en fonction de sa nature (liste ou container) :
        if(this.classList.contains("items-container")) { 
            addContainerListeners(this as HTMLDivElement)

            this.querySelectorAll('li').forEach((li: HTMLLIElement) => {
                handleItemDeletion(li.querySelector('button') as HTMLButtonElement)
                addDDListeners(li)
            })
        } else {
            addDDListeners(this)
            handleItemDeletion(this.querySelector('button') as HTMLButtonElement)
        }
    }
}

// handleDragEnd gère l'élément qu'on a sélectionné à la base une fois tout le process terminé :

function handleDragEnd(this: HTMLElement, e: DragEvent) {
    e.stopPropagation()
   
    if(this.classList.contains('items-container')) {
        addContainerListeners(this as HTMLDivElement)

        this.querySelectorAll('li').forEach((li: HTMLLIElement) => {
            handleItemDeletion(li.querySelector('button') as HTMLButtonElement)
            addDDListeners(li)
            } )
    } else {
    addDDListeners(this)
    }
}




//Add New Container

const addContainerBtn = document.querySelector('.add-container-btn') as HTMLButtonElement
const addContainerForm = document.querySelector('.add-new-container form') as HTMLFormElement
const addContainerFormInput = document.querySelector('.add-new-container input') as HTMLInputElement
const validationNewContainer = document.querySelector(".add-new-container .validation-msg") as HTMLSpanElement
const addContainerCloseBtn = document.querySelector('.close-add-list') as HTMLButtonElement
const addNewContainer = document.querySelector('.add-new-container') as HTMLDivElement
const containersList = document.querySelector('.main-content') as HTMLDivElement

//Ouvrir et fermer le formulaire :
addContainerBtn.addEventListener('click', () => {
    toggleForm(addContainerBtn, addContainerForm, true)
})

addContainerCloseBtn.addEventListener('click', () => {
    toggleForm(addContainerBtn, addContainerForm, false)
})

addContainerForm.addEventListener('submit', createNewContainer)

function createNewContainer(e: Event) {
    e.preventDefault()
    //Validation :
    if(addContainerFormInput.value.length === 0) {
        validationNewContainer.textContent = "Must be at least 1 character long"
        return;
    } else {
        validationNewContainer.textContent = ""
    }

    //On prend un élément existant :
    const itemsContainer = document.querySelector(".items-container") as HTMLDivElement
   

    //Puis on clone le noeud (l'enveloppe extérieure, le contenant):
    const newContainer = itemsContainer.cloneNode() as HTMLDivElement
    
    //On créé le contenu :
    const newContainerContent = `
    <div class="top-container">
      <h2>${addContainerFormInput.value}</h2>
      <button class="delete-container-btn">X</button>
    </div>
    <ul></ul>
    <button class="add-item-btn">Add an item</button>
    <form autocomplete="off">
      <div class="top-form-container">
        <label for="item">Add a new item</label>
        <button type="button" class="close-form-btn">X</button>
      </div>
      <input type="text" id="item" />
      <span class="validation-msg"></span>
      <button type="submit">Submit</button>
    </form>`

    //On assemble les deux :
    newContainer.innerHTML = newContainerContent

    //On insert dans le DOM :
  containersList.insertBefore(newContainer, addNewContainer)
  addContainerFormInput.value = ""
  addContainerListeners(newContainer)
}