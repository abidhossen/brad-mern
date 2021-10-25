import React, { useEffect } from 'react'
import { LinkContainer } from 'react-router-bootstrap'
import { Table, Button, Row, Col } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import Paginate from '../components/Paginate'

// Table Features Update Imports 
import BootstrapTable from 'react-bootstrap-table-next'
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.css';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import 'react-bootstrap-table2-filter/dist/react-bootstrap-table2-filter.min.css';
import ToolkitProvider, { Search, CSVExport } from 'react-bootstrap-table2-toolkit';
import 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.min.css';
import 'remixicon/fonts/remixicon.css'
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
// Table Features Update Imports

import {
  listProducts,
  deleteProduct,
  createProduct,
} from '../actions/productActions'
import { PRODUCT_CREATE_RESET } from '../constants/productConstants'

const ProductListScreen = ({ history, match }) => {
  const pageNumber = match.params.pageNumber || 1

  const dispatch = useDispatch()

  const productList = useSelector((state) => state.productList)
  const { loading, error, products, page, pages } = productList

  const productDelete = useSelector((state) => state.productDelete)
  const {
    loading: loadingDelete,
    error: errorDelete,
    success: successDelete,
  } = productDelete

  const productCreate = useSelector((state) => state.productCreate)
  const {
    loading: loadingCreate,
    error: errorCreate,
    success: successCreate,
    product: createdProduct,
  } = productCreate

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  useEffect(() => {
    dispatch({ type: PRODUCT_CREATE_RESET })

    if (!userInfo || !userInfo.isAdmin) {
      history.push('/login')
    }

    if (successCreate) {
      history.push(`/admin/product/${createdProduct._id}/edit`)
    } else {
      dispatch(listProducts('', pageNumber))
    }
  }, [
    dispatch,
    history,
    userInfo,
    successDelete,
    successCreate,
    createdProduct,
    pageNumber,
  ])

  const deleteHandler = (id) => {
    if (window.confirm('Are you sure')) {
      dispatch(deleteProduct(id))
    }
  }

  const createProductHandler = () => {
    dispatch(createProduct())
  }
  // Table Features Update Logics
  const { ExportCSVButton } = CSVExport;
  const { SearchBar } = Search;
  let id = 1;
  const columns = [
    {
      text: 'Id',
      formatter: (value, row) => {
        return (
          <div>
            {id++}
          </div>
        )
      },
      sort: true
    },
    { dataField: 'name', text: 'Name', sort: true },
    { dataField: 'price', text: 'Price', sort: true },
    { dataField: 'category', text: 'Category', sort: true },
    { dataField: 'brand', text: 'Brand', sort: true },
    {
      text: 'Action',
      formatter: (value, row) => {
        return (
          <div>
            <LinkContainer to={`/admin/product/${row._id}/edit`}>
              <Button variant='light' className='btn-sm'>
                <i className='fas fa-edit'></i>
              </Button>
            </LinkContainer>
            <Button
              variant='danger'
              className='btn-sm'
              onClick={() => deleteHandler(row._id)}
            >
              <i className='fas fa-trash'></i>
            </Button>
          </div>

        )
      }
    }
  ]
  console.log(products)
  const pagination = paginationFactory({
    page: 1,
    sizePerPage: 5,
    lastPageText: '>>',
    firstPageText: '<<',
    nextPageText: '>',
    prePageText: '<',
    showTotal: true,
    alwaysShowAllBtns: true,
    alwaysShowAllBtns: true,
    onPageChange: function (page, sizePerPage) {
      console.log('page', page);
      console.log('sizePerPage', sizePerPage);
    },
    onSizePerPageChange: function (page, sizePerPage) {
      console.log('page', page);
      console.log('sizePerPage', sizePerPage)
    }
  })
  const printDocument = () => {
    const input = document.getElementById('divToPrint');
    html2canvas(input)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'landscape',
        });
        const imgProps= pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('download.pdf');
      })
      ;
  }
  return (
    <>
      <Row className='align-items-center'>
        <Col>
          <h1>Products</h1>
        </Col>
        <Col className='text-right'>
          <Button className='my-3' onClick={createProductHandler}>
            <i className='fas fa-plus'></i> Create Product
          </Button>
        </Col>
      </Row>
      {loadingDelete && <Loader />}
      {errorDelete && <Message variant='danger'>{errorDelete}</Message>}
      {loadingCreate && <Loader />}
      {errorCreate && <Message variant='danger'>{errorCreate}</Message>}
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <div >
          {/* This is the previous code for previous table which doesn't support search, filter, pagination, sort and export */}
          {/* <Table striped bordered hover responsive className='table-sm'>
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>PRICE</th>
                <th>CATEGORY</th>
                <th>BRAND</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product._id}</td>
                  <td>{product.name}</td>
                  <td>${product.price}</td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
                  <td>
                    <LinkContainer to={`/admin/product/${product._id}/edit`}>
                      <Button variant='light' className='btn-sm'>
                        <i className='fas fa-edit'></i>
                      </Button>
                    </LinkContainer>
                    <Button
                      variant='danger'
                      className='btn-sm'
                      onClick={() => deleteHandler(product._id)}
                    >
                      <i className='fas fa-trash'></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table> */}
          {/* This is the previous code for previous table which doesn't support search, filter, pagination, sort and export */}

          {/* Table Features Update with search, sort, filter, pagination and export*/}
          <ToolkitProvider
            bootstrap4 keyField="id" columns={columns} data={products} search exportCSV
          >
            {
              props => (
                <div>
                  <SearchBar {...props.searchProps} />

                  < BootstrapTable striped  id="divToPrint" pagination={pagination}
                    {...props.baseProps}
                  />
                  <ExportCSVButton className="btn btn-success" {...props.csvProps}>
                    <i class="ri-download-fill"></i> Export CSV</ExportCSVButton>

                  <button className="btn btn-danger ml-3" onClick={() => printDocument()}> <i class="ri-download-fill"></i> Download Pdf</button>

                </div>
              )
            }
          </ToolkitProvider>
          {/* <Paginate pages={pages} page={page} isAdmin={true} /> */}
          {/* <BootstrapTable keyField="id" columns={columns} data={products}/> */}
        </div>
      )}

    </>
  )
}

export default ProductListScreen
