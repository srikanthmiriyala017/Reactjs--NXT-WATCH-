import {Component} from 'react'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import {AiOutlineSearch} from 'react-icons/ai'
import Header from '../Header'
import SideBarCard from '../SideBarCard'
import BannerCard from '../BannerCard'
import VideoCard from '../VideoCard'
import NxtThemeContext from '../../NxtThemeContext/ThemeContext'
import './index.css'
import {
  HomeContainer,
  InputField,
  SearchContainer,
  SearchButton,
  NoVideoHeading,
  NoVideoDescription,
  NoVideosContainer,
  FailureContainer,
} from './StyledComponent'

const viewsList = {
  Initial: 'INITIAL',
  Success: 'SUCCESS',
  Failure: 'FAILURE',
  InProgress: 'IN_PROGRESS',
}

class Home extends Component {
  state = {
    homeVideosDataList: [],
    bannerShow: true,
    searchInput: '',
    searchValue: '',
    viewStatus: viewsList.Initial,
  }

  componentDidMount() {
    this.getHomeVideosData()
  }

  getHomeVideosData = async () => {
    this.setState({viewStatus: viewsList.InProgress})
    const token = Cookies.get('jwt_token')
    const {searchValue} = this.state
    const homeVideosApiUrl = `https://apis.ccbp.in/videos/all?search=${searchValue}`
    const options = {
      method: 'GET',
      headers: {Authorization: `Bearer ${token}`},
    }
    const response = await fetch(homeVideosApiUrl, options)
    const data = await response.json()
    if (response.ok === true) {
      const {videos} = data
      const updateVideosData = videos.map(eachData => ({
        id: eachData.id,
        title: eachData.title,
        channel: eachData.channel,
        publishedAt: eachData.published_at,
        thumbnailUrl: eachData.thumbnail_url,
        viewCount: eachData.view_count,
      }))
      this.setState({
        homeVideosDataList: updateVideosData,
        viewStatus: viewsList.Success,
      })
    } else {
      this.setState({viewStatus: viewsList.Failure})
    }
  }

  onClose = () => {
    this.setState({bannerShow: false})
  }

  onChangeSearchInput = event => {
    this.setState({searchInput: event.target.value})
  }

  onSearch = () => {
    const {searchInput} = this.state
    this.setState({searchValue: searchInput}, this.getHomeVideosData)
  }

  onRetry = () => {
    this.getHomeVideosData()
  }

  homeVideosData = () => {
    const {homeVideosDataList} = this.state

    return (
      <NxtThemeContext.Consumer>
        {value => {
          const {theme} = value
          return (
            <>
              {homeVideosDataList.length === 0 ? (
                <NoVideosContainer value={theme}>
                  <img
                    src="https://assets.ccbp.in/frontend/react-js/nxt-watch-no-search-results-img.png"
                    alt="no videos"
                    className="no-videos-image"
                  />
                  <NoVideoHeading value={theme}>
                    No Search results found
                  </NoVideoHeading>
                  <NoVideoDescription value={theme}>
                    Try different key words or remove search filter
                  </NoVideoDescription>
                  <button
                    type="button"
                    className="retry-button"
                    onClick={this.onRetry}
                  >
                    Retry
                  </button>
                </NoVideosContainer>
              ) : (
                <ul className="home-list-container">
                  {homeVideosDataList.map(eachVideoData => (
                    <VideoCard
                      eachVideoData={eachVideoData}
                      key={eachVideoData.id}
                    />
                  ))}
                </ul>
              )}
            </>
          )
        }}
      </NxtThemeContext.Consumer>
    )
  }

  homeFailureContainer = () => (
    <NxtThemeContext.Consumer>
      {value => {
        const {theme} = value
        const failureImage = theme
          ? 'https://assets.ccbp.in/frontend/react-js/nxt-watch-failure-view-dark-theme-img.png'
          : 'https://assets.ccbp.in/frontend/react-js/nxt-watch-failure-view-light-theme-img.png'
        return (
          <FailureContainer value={theme}>
            <img
              src={failureImage}
              alt="failure view"
              className="failure-view-image"
            />
            <NoVideoHeading value={theme}>
              Oops! Something Went Wrong
            </NoVideoHeading>
            <NoVideoDescription>
              We are having some trouble to complete your request. Please
              try again.
            </NoVideoDescription>
            <button
              type="button"
              className="retry-button"
              onClick={this.onRetry}
            >
              Retry
            </button>
          </FailureContainer>
        )
      }}
    </NxtThemeContext.Consumer>
  )

  homeContainerLoader = () => (
    <NxtThemeContext.Consumer>
      {value => {
        const {theme} = value
        const loaderColor = theme ? '#ffffff' : '#0f0f0f'
        return (
          <div className="loader-container" data-testid="loader">
            <Loader
              type="ThreeDots"
              color={loaderColor}
              height="50"
              width="50"
            />
          </div>
        )
      }}
    </NxtThemeContext.Consumer>
  )

  resultViewStatus = () => {
    const {viewStatus} = this.state
    switch (viewStatus) {
      case viewsList.Success:
        return this.homeVideosData()
      case viewsList.Failure:
        return this.homeFailureContainer()
      case viewsList.InProgress:
        return this.homeContainerLoader()
      default:
        return null
    }
  }

  render() {
    const {bannerShow, searchInput} = this.state

    return (
      <NxtThemeContext.Consumer>
        {value => {
          const {theme} = value
          return (
            <>
              <HomeContainer data-testid="home" value={theme}>
                <Header />
                <div className="home-container">
                  <SideBarCard />
                  <div className="home-sub-container">
                    {bannerShow ? (
                      <div className="banner-container" data-testid="banner">
                        <BannerCard onClose={this.onClose} />
                      </div>
                    ) : null}
                    <SearchContainer>
                      <InputField
                        type="search"
                        placeholder="Search"
                        onChange={this.onChangeSearchInput}
                        value={searchInput}
                      />
                      <SearchButton
                        type="button"
                        data-testid="searchButton"
                        value={theme}
                        onClick={this.onSearch}
                      >
                        <AiOutlineSearch size={20} className="search-icon" />
                      </SearchButton>
                    </SearchContainer>
                    {this.resultViewStatus()}
                  </div>
                </div>
              </HomeContainer>
            </>
          )
        }}
      </NxtThemeContext.Consumer>
    )
  }
}
export default Home
