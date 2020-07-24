from gatco.response import json, text
from application.server import app
from application.database import db
from application.extensions import auth

from application.models.model import User, Role
import pandas as pd
import numpy as np
from sqlalchemy import create_engine
import datetime
@app.route("/user_test")
async def user_test(request):
    return text("user_test api")

@app.route("/horizontal-data", methods=["GET"])
async def user_login(request):
    result = {}
    conn = create_engine('postgresql://semester3user:123456@localhost:5432/semester3db')
    Invoice = pd.read_sql_table('Invoice', conn)
    Customer = pd.read_sql_table('Customer', conn)
    Album = pd.read_sql_table('Album', conn)
    Track = pd.read_sql_table('Track', conn)
    result['invoice_count'] = len(Invoice)
    result['invoice_total'] = Invoice['Total'].sum()
    result['customer_count'] = len(Customer)
    result['album_count'] = len(Album)
    result['track_count'] = len(Track)
    return json(result)

@app.route("/top_20_album_best_seller", methods=["GET"])
async def user_login(request):
    result = {}
    conn = create_engine('postgresql://semester3user:123456@localhost:5432/semester3db')
    Album = pd.read_sql_table('Album', conn)
    # Invoice = Invoice.loc[:, ['Date','tenkan_sen','kijun_sen','senkou_span_a','senkou_span_b', 'chikou_span']]
    Track = pd.read_sql_table('Track', conn)
    Track = Track.loc[:,['TrackId','AlbumId']]
    InvoiceLine = pd.read_sql_table('InvoiceLine', conn)
    InvoiceLine = InvoiceLine.loc[:,['TrackId','InvoiceLineId']]
    invoiceline_track = Track.join(InvoiceLine.set_index('TrackId'), on='TrackId')
    invoiceline_track_groupby = invoiceline_track.groupby(['AlbumId']).size()

    list_album_id = invoiceline_track_groupby.index.tolist()
    list_album_count = invoiceline_track_groupby.values.tolist()
    df_list_album_group_by = pd.DataFrame(data={
        'AlbumId':list_album_id,
        'Count':list_album_count
    })
    Album = Album.join(df_list_album_group_by.set_index('AlbumId'), on='AlbumId')
    top_album = Album.sort_values(by=['Count'],ascending=False).head(20)
    result['x'] = top_album['Title'].to_list()
    result['y'] = top_album['Count'].to_list()
    return json(result)

@app.route("/percen_genre", methods=["GET"])
async def user_login(request):
    result = {}
    conn = create_engine('postgresql://semester3user:123456@localhost:5432/semester3db')
    Genre = pd.read_sql_table('Genre', conn)
    Track = pd.read_sql_table('Track', conn)
    Track = Track.loc[:,['TrackId','GenreId']]
    InvoiceLine = pd.read_sql_table('InvoiceLine', conn)
    InvoiceLine = InvoiceLine.loc[:,['TrackId','InvoiceLineId']]
    
    invoiceline_track = Track.join(InvoiceLine.set_index('TrackId'), on='TrackId')
    invoiceline_track_groupby_genre = invoiceline_track.groupby(['GenreId']).size()

    list_genre_id = invoiceline_track_groupby_genre.index.tolist()
    list_genre_sale = invoiceline_track_groupby_genre.values.tolist()

    df_genre_group_by = pd.DataFrame(data={
        'GenreId':list_genre_id,
        'Count':list_genre_sale
    })

    Genre = Genre.join(df_genre_group_by.set_index('GenreId'), on='GenreId')
    
    
    # invoiceline_track_groupby_index = invoiceline_track_groupby_genre.index.to_list()

    result['x'] = Genre['Name'].to_list()
    result['y'] = Genre['Count'].to_list()
    return json(result)

@app.route("/sale_city", methods=["GET"])
async def user_login(request):
    result = {}
    conn = create_engine('postgresql://semester3user:123456@localhost:5432/semester3db')
    Invoice = pd.read_sql_table('Invoice', conn)
    Invoice = Invoice.groupby(['BillingCity'])['Total'].sum().reset_index()
    result['x'] = Invoice['BillingCity'].to_list()
    result['y'] = Invoice['Total'].to_list()
    return json(result)

@app.route("/sale_grow", methods=["GET"])
async def user_login(request):
    interval = 'day'
    from_date = 1230768000
    to_date = 1233446400
    # displacement_date = to_date
    result = {}
    result['x'] = []
    result['invoice_count'] = []
    result['invoice_total'] = []
    conn = create_engine('postgresql://semester3user:123456@localhost:5432/semester3db')
    Invoice = pd.read_sql_table('Invoice', conn)
    
    Invoice['InvoiceDateTs'] = Invoice['InvoiceDate'].astype(np.int).div(1000000000).astype(np.int)
    # print(Invoice)
    while(from_date <= to_date):
        mask1 = Invoice['InvoiceDateTs'] >= from_date
        mask2 = Invoice['InvoiceDateTs'] <= from_date + 86400
        invoice_filter = Invoice[(mask1 & mask2)]
        # print(invoice_filter)
        result['invoice_total'].append(invoice_filter['Total'].sum())
        result['invoice_count'].append(len(invoice_filter))
        result['x'].append(from_date)
        from_date = from_date + 86400
    return json(result)