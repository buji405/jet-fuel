
$(function() {
  getFolders()
})

$('.submit').on('click', (e) => {
  let folderInput = $('.folder-input').val()
  e.preventDefault()
  console.log(folderInput);
  clearInputs(folderInput)
  $('.folder-list-container').append(addFolder(folderInput))
})

const clearInputs = (folderInput) => {
  $('.input').val('')
}

const addFolder = (folderInput) => {
  fetch(`/api/v1/folders`, {
    headers: {
      'Content-Type': "application/json"
    },
    method: 'POST',
    body: JSON.stringify({
      'folderName': folderInput
    })
  })
  return `<button class="folder">${folderInput}</button>`
}

const getFolders = () => {
  fetch(`/api/v1/folders`)
  .then((res) => res.json())
  .then((folderName) => {
    folderName.forEach((folderName) => {
      $('.folder-list-container').append(`<button class="folder">${folderName.folderName}</button>`)
    })
  })
}
