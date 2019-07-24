(function () {
  // =================== Declare Variables ===================

  const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
  const INDEX_URL = BASE_URL + '/api/v1/users/'

  const dataPanel = document.querySelector('#data-panel')
  const searchInput = document.querySelector('#search-input')
  const searchForm = document.querySelector('#search')
  const displayModeSelector = document.getElementById('display-mode-selector')
  const pagination = document.getElementById('pagination')

  const data = JSON.parse(localStorage.getItem('followingContacts')) || []

  let paginationData = []
  const ITEM_PER_PAGE = 12
  let displayMode = 'card'
  let currentPage = 1

  // =================== Declare Functions ===================
  // Function: get total pages of the data source (12 contact per page)
  function getTotalPages(data) {
    let totalPages = Math.ceil(data.length / ITEM_PER_PAGE) || 1
    let pageItemContent = ''
    for (let i = 0; i < totalPages; i++) {
      pageItemContent += `
        <li class="page-item">
          <a class="page-link" href="javascript:;" data-page="${i + 1}">${i + 1}</a>
        </li>
      `
    }
    pagination.innerHTML = pageItemContent
  }

  // Function: get page data of specific page number
  function getPageData(pageNum, data) {
    paginationData = data || paginationData
    let offset = (pageNum - 1) * ITEM_PER_PAGE
    let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
    displayDataList(pageData)

    // deactive pagination state
    Array.prototype.forEach.call(pagination.children, item => {
      item.className = "page-item"
    })
    // set the current pagination state to active
    pagination.children[pageNum - 1].className = "page-item active"
  }

  // Function: display data
  function displayDataList(data) {
    let htmlContent = ''
    if (displayMode === 'card') {
      data.forEach(function (item, index) {
        htmlContent += `
          <div class="col-12 col-sm-6 col-md-3">
            <div class="card mb-2">
              <img class="card-img-top" src="${item.avatar}" alt="avatar">
              <div class="card-body contact-item-body">
                <p class="card-text text-center">${item.name} ${item.surname}</p>
              </div>
              <div class="card-footer text-center">
                <button class="btn btn-primary btn-show-contact" data-toggle="modal" data-target="#show-contact-modal" data-id="${item.id}">More</button>
                <button class="btn btn-info btn-add-following" data-id="${item.id}">
        `
        if (item.follow === true) {
          htmlContent += `Following`
        } else {
          htmlContent += `Follow`
        }
        htmlContent += `
                </button>
              </div>
            </div>
          </div> 
        `
      })
    } else if (displayMode === 'list') {
      htmlContent += `
        <table class="table">
          <tbody>
      `
      data.forEach(function (item, index) {
        htmlContent += `
            <tr class="row ml-3 mr-3">
              <td class="col-sm-1"><img src="${item.avatar}" style="width: 40px; border-radius: 50%;"></td>
              <td class="col-sm-6">${item.name} ${item.surname}</td>
              <td class="col-sm-5">
                <button class="btn btn-primary btn-show-contact" data-toggle="modal" data-target="#show-contact-modal" data-id="${item.id}">More</button>
                <button class="btn btn-info btn-add-following" data-id="${item.id}">`

        if (item.follow === true) {
          htmlContent += `Following`
        } else {
          htmlContent += `Follow`
        }
        htmlContent += `
                </button>
              </td>
            </tr>
        `
      })
      htmlContent += `
          </tbody>
        </table>  
      `
    }
    dataPanel.innerHTML = htmlContent
  }

  // Function: display modal of personal info
  function showContact(id) {
    // get elements
    const modalName = document.getElementById('show-contact-name')
    const modalImage = document.getElementById('show-contact-image')
    const modalEmail = document.getElementById('show-contact-email')
    const modalGender = document.getElementById('show-contact-gender')
    const modalAge = document.getElementById('show-contact-age')
    const modalRegion = document.getElementById('show-contact-region')
    const modalBirthday = document.getElementById('show-contact-birthday')

    // set request url
    const url = INDEX_URL + id

    // send request to show api
    axios.get(url).then(response => {
      const data = response.data

      // insert data into modal ui
      modalName.textContent = data.name + " " + data.surname
      modalImage.innerHTML = `<img src="${data.avatar}" class="img-fluid" alt="Avatar image">`
      modalEmail.innerHTML = `<i class="fas fa-envelope"></i>  ${data.email}`
      modalGender.innerHTML = `<i class="fas fa-user"></i>  ${data.gender}`
      modalAge.innerHTML = `<i class="fas fa-info-circle"></i>  ${data.age} years old`
      modalRegion.innerHTML = `<i class="fas fa-map-marker-alt"></i>  ${data.region}`
      modalBirthday.innerHTML = `<i class="fas fa-birthday-cake"></i>  ${data.birthday}`
    })
  }

  // Function: add or remove the contact to following list (local storage)
  function toggleFollowingContact(id) {
    const list = JSON.parse(localStorage.getItem('followingContacts')) || []
    const contact = data.find(item => item.id === Number(id))

    if (list.some(item => item.id === Number(id))) {
      console.log(`Remove ${contact.name} ${contact.surname} from the following list`)

      // find contact by id
      const index = list.findIndex(item => item.id === Number(id))
      // remove following contact
      list.splice(index, 1)
      contact.follow = false
    } else {
      list.push(contact)
      contact.follow = true
      console.log(`Added ${contact.name} ${contact.surname} to the following list!`)
    }

    // update local storage
    localStorage.setItem('followingContacts', JSON.stringify(list))
    // repaint the data panel
    getTotalPages(data)
    getPageData(currentPage, data)
  }



  // =================== Code starts from here ===================
  // display following contacts
  getTotalPages(data)
  getPageData(1, data)

  // Event Listener 1. listen to data panel
  // ==> (1) display contact modal or (2) manage favorite list
  dataPanel.addEventListener('click', (event) => {
    if (event.target.matches('.btn-show-contact')) {
      console.log(event.target.dataset.id)
      showContact(event.target.dataset.id)
    } else if (event.target.matches('.btn-add-following')) {
      toggleFollowingContact(event.target.dataset.id)
    }
  })

  // Event Listener 2. listen to search form  
  searchForm.addEventListener('submit', event => {
    event.preventDefault()

    let results = []
    const regex = new RegExp(searchInput.value, 'i')
    results = data.filter(item => item.name.match(regex) || item.surname.match(regex))
    getTotalPages(results)
    getPageData(1, results)
  })

  // Event Listener 3. listen to display mode selector
  displayModeSelector.addEventListener('click', event => {
    console.log('toggle display mode')
    displayMode = event.target.dataset.displaymode
    getTotalPages(data)
    getPageData(currentPage, data)
  })

  // Event Listener 4. listen to pagination
  pagination.addEventListener('click', event => {
    if (event.target.tagName === 'A') {
      currentPage = event.target.dataset.page
      getPageData(currentPage, data)
    }
  })

})()